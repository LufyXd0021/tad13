"""Servidor web y puente a Gemini. Nunca expone la clave al navegador."""
import asyncio
from collections import defaultdict, deque
import math
import json
import os
from pathlib import Path
import re
import time
from typing import Literal

import httpx
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, ConfigDict, Field

WEB_ROOT = Path(__file__).resolve().parents[1] / "web"
YEARS = list(range(2020, 2027))
REGIONS = ["Antioquia", "Atlántico", "Bogotá D.C.", "Bolívar", "Cundinamarca", "Santander", "Valle del Cauca"]
CATEGORIES = ["Hurto", "Lesiones", "Violencia intrafamiliar", "Homicidio", "Extorsión", "Otros"]
SYSTEM_INSTRUCTION = (
    "Eres un asistente para un prototipo de análisis de tendencias delictivas en Colombia. "
    "Responde en español de forma clara y concisa. El contexto proporcionado contiene "
    "ÚNICAMENTE datos sintéticos, no proviene de SIEDCO y no representa criminalidad real. "
    "Indícalo al interpretar las cifras. No inventes datos, fuentes ni conclusiones causales; "
    "si preguntan algo que no puede deducirse del contexto, explica esa limitación. "
    "No solicites ni divulgues datos personales o secretos."
)

class Filters(BaseModel):
    model_config = ConfigDict(extra="forbid")
    year: Literal["todos", "2020", "2021", "2022", "2023", "2024", "2025", "2026"] = "todos"
    region: Literal["todos", "Antioquia", "Atlántico", "Bogotá D.C.", "Bolívar", "Cundinamarca", "Santander", "Valle del Cauca"] = "todos"
    category: Literal["todos", "Hurto", "Lesiones", "Violencia intrafamiliar", "Homicidio", "Extorsión", "Otros"] = "todos"

class ChatRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    question: str = Field(min_length=1, max_length=300)
    filters: Filters


def demo_context(filters: Filters) -> dict:
    """Reconstruye la misma muestra sintética que data.js, sin confiar en cifras del cliente."""
    categories = {category: 0 for category in CATEGORIES}
    regions = {region: 0 for region in REGIONS}
    yearly = {str(year): 0 for year in YEARS}
    monthly = {str(month): 0 for month in range(1, 13)}
    for yi, year in enumerate(YEARS):
        if filters.year != "todos" and filters.year != str(year):
            continue
        for ri, region in enumerate(REGIONS):
            if filters.region != "todos" and filters.region != region:
                continue
            for ci, category in enumerate(CATEGORIES):
                if filters.category != "todos" and filters.category != category:
                    continue
                for mi in range(12):
                    noise = (yi * 29 + ri * 17 + ci * 13 + mi * 7) % 31
                    value = max(3, math.floor((116 - ri * 8) * (1 - ci * 0.125) * (0.78 + yi * 0.045) + noise - mi % 4 * 3 + 0.5))
                    categories[category] += value
                    regions[region] += value
                    yearly[str(year)] += value
                    monthly[str(mi + 1)] += value
    return {
        "naturaleza": "TODOS LOS DATOS SON SINTÉTICOS Y NO SON CIFRAS REALES NI SIEDCO",
        "filtros": filters.model_dump(),
        "total_simulado": sum(categories.values()),
        "por_categoria": categories,
        "por_territorio": regions,
        "por_anio": yearly,
        "por_mes": monthly,
    }

app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)

@app.middleware("http")
async def limit_declared_body(request: Request, call_next):
    # Complementar con un límite de tamaño en el proxy del alojamiento.
    if request.url.path == "/api/chat":
        try:
            length = int(request.headers.get("content-length", "0"))
        except ValueError:
            return JSONResponse({"detail": "Solicitud inválida."}, status_code=400)
        if length > 4096:
            return JSONResponse({"detail": "La solicitud es demasiado grande."}, status_code=413)
    return await call_next(request)
_rate_lock = asyncio.Lock()
_client_requests = defaultdict(deque)
_global_requests = deque()

async def check_rate_limit(client: str) -> None:
    """Límite básico por proceso; no sustituye protección en el proveedor de alojamiento."""
    now = time.monotonic()
    async with _rate_lock:
        for ip in list(_client_requests):
            queue = _client_requests[ip]
            while queue and queue[0] <= now - 60:
                queue.popleft()
            if not queue:
                del _client_requests[ip]
        while _global_requests and _global_requests[0] <= now - 86400:
            _global_requests.popleft()
        queue = _client_requests[client]
        if len(queue) >= 8 or len(_global_requests) >= 300:
            raise HTTPException(429, "Límite de solicitudes alcanzado. Inténtalo más tarde.")
        queue.append(now)
        _global_requests.append(now)

@app.post("/api/chat")
async def chat(payload: ChatRequest, request: Request):
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not key:
        raise HTTPException(503, "El asistente aún no está configurado en el servidor.")
    model = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
    if not re.fullmatch(r"gemini-[A-Za-z0-9._-]+", model):
        raise HTTPException(503, "El modelo de IA no está configurado correctamente.")
    await check_rate_limit(request.client.host if request.client else "unknown")
    context = json.dumps(demo_context(payload.filters), ensure_ascii=False)
    body = {
        "system_instruction": {"parts": [{"text": SYSTEM_INSTRUCTION}]},
        "contents": [{"role": "user", "parts": [{"text": f"Contexto de datos simulados: {context}\n\nPregunta: {payload.question}"}]}],
        "generationConfig": {"maxOutputTokens": 1024, "temperature": 0.3},
    }
    try:
        async with httpx.AsyncClient(timeout=25.0) as client:
            result = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
                headers={"x-goog-api-key": key}, json=body,
            )
            result.raise_for_status()
            response = result.json()
        parts = response.get("candidates", [{}])[0].get("content", {}).get("parts", [])
        answer = "\n".join(part["text"] for part in parts if isinstance(part.get("text"), str)).strip()
        if not answer:
            raise ValueError("empty response")
    except (httpx.HTTPError, ValueError, KeyError, IndexError, TypeError):
        raise HTTPException(502, "No se pudo obtener una respuesta de Gemini. Inténtalo más tarde.") from None
    return JSONResponse({"answer": answer}, headers={"Cache-Control": "no-store"})

# Solo se publican los archivos web; el repositorio y los datos locales quedan fuera.
app.mount("/", StaticFiles(directory=WEB_ROOT, html=True), name="web")
