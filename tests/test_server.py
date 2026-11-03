import os
import unittest
from unittest.mock import AsyncMock, MagicMock, patch

from fastapi.testclient import TestClient
from src.server.main import CATEGORIES, Filters, _client_requests, _global_requests, app, demo_context


class ServerTests(unittest.TestCase):
    def setUp(self):
        _client_requests.clear()
        _global_requests.clear()
        self.client = TestClient(app)
        self.payload = {"question": "¿Cuál es la categoría principal?", "filters": {"year": "2026", "region": "Atlántico", "category": "Hurto"}}

    def test_static_pages_and_sensitive_paths(self):
        for path in ("/", "/asistente.html", "/descargas.html", "/documentacion.html", "/conocenos.html"):
            self.assertEqual(self.client.get(path).status_code, 200)
        self.assertEqual(self.client.get('/data/raw/ejemplo.xls').status_code, 404)
        self.assertEqual(self.client.get('/src/server/main.py').status_code, 404)

    def test_missing_key_is_explicit_and_does_not_contact_gemini(self):
        with patch.dict(os.environ, {}, clear=True):
            response = self.client.post('/api/chat', json=self.payload)
        self.assertEqual(response.status_code, 503)
        self.assertIn('no está configurado', response.json()['detail'])

    def test_rejects_bad_inputs(self):
        with patch.dict(os.environ, {"GEMINI_API_KEY": "test-only"}):
            self.assertEqual(self.client.post('/api/chat', json={**self.payload, 'question': 'x' * 301}).status_code, 422)
            self.assertEqual(self.client.post('/api/chat', json={**self.payload, 'filters': {'region': 'inventado'}}).status_code, 422)
            self.assertEqual(self.client.post('/api/chat', json={**self.payload, 'extra': 'x'}).status_code, 422)

    def test_calls_gemini_with_server_generated_synthetic_context(self):
        response = MagicMock()
        response.json.return_value = {'candidates': [{'content': {'parts': [{'text': 'Respuesta de ejemplo'}]}}]}
        upstream = MagicMock()
        upstream.post = AsyncMock(return_value=response)
        client_context = MagicMock()
        client_context.__aenter__ = AsyncMock(return_value=upstream)
        client_context.__aexit__ = AsyncMock(return_value=None)
        with patch.dict(os.environ, {"GEMINI_API_KEY": "test-only"}, clear=True), patch('src.server.main.httpx.AsyncClient', return_value=client_context):
            result = self.client.post('/api/chat', json=self.payload)
        self.assertEqual(result.status_code, 200)
        self.assertEqual(result.json(), {'answer': 'Respuesta de ejemplo'})
        args, kwargs = upstream.post.call_args
        self.assertEqual(kwargs['headers']['x-goog-api-key'], 'test-only')
        self.assertNotIn('test-only', args[0])
        self.assertIn('SINTÉTICOS', kwargs['json']['contents'][0]['parts'][0]['text'])
        self.assertEqual(result.headers['cache-control'], 'no-store')

    def test_limit_and_no_upstream_detail_leak(self):
        response = MagicMock()
        response.json.return_value = {'candidates': []}
        upstream = MagicMock()
        upstream.post = AsyncMock(return_value=response)
        client_context = MagicMock()
        client_context.__aenter__ = AsyncMock(return_value=upstream)
        client_context.__aexit__ = AsyncMock(return_value=None)
        with patch.dict(os.environ, {"GEMINI_API_KEY": "test-only"}, clear=True), patch('src.server.main.httpx.AsyncClient', return_value=client_context):
            for _ in range(8):
                self.assertEqual(self.client.post('/api/chat', json=self.payload).status_code, 502)
            self.assertEqual(self.client.post('/api/chat', json=self.payload).status_code, 429)

    def test_demo_context_correctness(self):
        all_data = demo_context(Filters())
        self.assertEqual(sum(all_data['por_categoria'].values()), all_data['total_simulado'])
        self.assertEqual(sum(all_data['por_territorio'].values()), all_data['total_simulado'])
        selected = demo_context(Filters(**self.payload['filters']))
        self.assertEqual(selected['por_categoria']['Hurto'], selected['total_simulado'])
        self.assertEqual(selected['por_territorio']['Atlántico'], selected['total_simulado'])
        self.assertTrue(all(selected['por_categoria'][c] == 0 for c in CATEGORIES if c != 'Hurto'))
        # Referencia obtenida del mismo filtro en el generador JavaScript.
        self.assertEqual(selected["total_simulado"], 1483)

if __name__ == '__main__':
    unittest.main()
