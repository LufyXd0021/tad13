import {years, regions, categories, colors, months, makeDemoData, filterRows, sum, grouped, summarize, answerQuestion, demoCsv} from './data.js';

const icons = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  chart: '<path d="M3 3v18h18M7 15l4-4 3 2 5-6"/>', pin: '<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5"/>', book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5ZM4 21a2.5 2.5 0 0 1 2.5-2H20M8 7h8M8 11h8"/>',
  spark: '<path d="m12 2 1.7 6.3L20 10l-6.3 1.7L12 18l-1.7-6.3L4 10l6.3-1.7L12 2ZM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z"/>',
  download: '<path d="M12 3v12m-4-4 4 4 4-4M4 17v3h16v-3"/>', people: '<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 5v1"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>', filter: '<path d="M4 7h16M7 12h10M10 17h4"/><circle cx="8" cy="7" r="1.5" fill="currentColor"/><circle cx="15" cy="12" r="1.5" fill="currentColor"/>',
  refresh: '<path d="M20 7v5h-5M4 17v-5h5M5 9a8 8 0 0 1 13-3l2 2M4 16l2 2a8 8 0 0 0 13-3"/>', file: '<path d="M6 3h8l4 4v14H6zM14 3v5h4M9 13h6M9 17h6"/>', calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01"/>'
};
document.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[el.dataset.icon]}</svg>`; });
const fmt = new Intl.NumberFormat('es-CO');
const rows = makeDemoData();
const yearSelect = document.querySelector('#year-filter');
const regionSelect = document.querySelector('#region-filter');
const categorySelect = document.querySelector('#category-filter');
function addOptions(select, options) { options.forEach(value => select.add(new Option(value, value))); }
addOptions(yearSelect, years); addOptions(regionSelect, regions); addOptions(categorySelect, categories);
const setText = (selector, text) => { document.querySelector(selector).textContent = text; };

function renderTrend(data, byMonth) {
  const series = byMonth ? grouped(data, 'month', months.map((_, i) => i + 1)).map((item, i) => ({label: months[i], value: item.value})) : grouped(data, 'year', years);
  const width = 700, height = 220, left = 44, right = 12, top = 16, bottom = 32;
  const max = Math.max(...series.map(item => item.value), 1) * 1.16;
  const x = i => left + i * (width - left - right) / Math.max(series.length - 1, 1);
  const y = value => top + (height - top - bottom) * (1 - value / max);
  const points = series.map((item, i) => `${x(i)},${y(item.value)}`).join(' ');
  const grid = [0, 0.25, 0.5, 0.75, 1].map(f => `<line x1="${left}" y1="${y(max * f)}" x2="${width-right}" y2="${y(max*f)}" stroke="#edf0eb"/><text x="${left-10}" y="${y(max*f)+4}" text-anchor="end" fill="#a0a9a3" font-size="10">${max >= 10000 ? `${fmt.format(Math.round(max*f/1000))}k` : fmt.format(Math.round(max*f))}</text>`).join('');
  const labels = series.map((item, i) => `<text x="${x(i)}" y="${height-6}" text-anchor="middle" fill="#919d95" font-size="10">${item.label}</text>`).join('');
  const dots = series.map((item, i) => `<circle cx="${x(i)}" cy="${y(item.value)}" r="4" fill="#fff" stroke="#26745d" stroke-width="2"><title>${item.label}: ${fmt.format(item.value)} registros simulados</title></circle>`).join('');
  document.querySelector('#trend-chart').innerHTML = `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="area" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#a5cdb6" stop-opacity=".45"/><stop offset="1" stop-color="#e6f0e8" stop-opacity=".08"/></linearGradient></defs>${grid}<polygon points="${left},${height-bottom} ${points} ${width-right},${height-bottom}" fill="url(#area)"/><polyline points="${points}" fill="none" stroke="#26745d" stroke-width="2.5" stroke-linejoin="round"/>${dots}${labels}</svg>`;
  document.querySelector('#trend-chart').setAttribute('aria-label', `Evolución de registros simulados: ${series.map(i => `${i.label}, ${fmt.format(i.value)}`).join('; ')}`);
}
function renderCategories(data) {
  const items = grouped(data, 'category', categories).filter(i => i.value > 0);
  const total = sum(data); let offset = 0;
  const segments = items.map(item => { const start = offset; offset += item.value / total * 100; return `${colors[categories.indexOf(item.label)]} ${start}% ${offset}%`; });
  document.querySelector('#donut-chart').style.background = `conic-gradient(${segments.join(', ')})`;
  setText('#donut-total', fmt.format(total));
  document.querySelector('#category-legend').innerHTML = items.map(item => `<div class="legend-row"><span class="legend-name"><i style="background:${colors[categories.indexOf(item.label)]}"></i>${item.label}</span><span><strong>${fmt.format(item.value)}</strong><small>${(item.value / total * 100).toFixed(1).replace('.', ',')}%</small></span></div>`).join('');
}
function renderRegions(data) {
  const items = grouped(data, 'region', regions).filter(i => i.value > 0).sort((a,b) => b.value-a.value);
  const max = Math.max(...items.map(i => i.value), 1);
  document.querySelector('#region-bars').innerHTML = items.map((item, i) => `<div class="region-row"><span class="region-rank">${String(i+1).padStart(2,'0')}</span><span class="region-name">${item.label}</span><span class="bar-track"><span style="width:${item.value/max*100}%"></span></span><strong>${fmt.format(item.value)}</strong></div>`).join('');
}
function currentFilters() { return {year: yearSelect.value, region: regionSelect.value, category: categorySelect.value}; }
function currentData() { return filterRows(rows, currentFilters()); }
function render() {
  const filters = currentFilters();
  const data = currentData(), total = sum(data);
  setText('#total-stat', fmt.format(total));
  setText('#regions-stat', new Set(data.map(row => row.region)).size.toString().padStart(2, '0'));
  setText('#categories-stat', new Set(data.map(row => row.category)).size.toString().padStart(2, '0'));
  setText('#period-stat', filters.year === 'todos' ? '2020 – 2026' : filters.year);
  setText('#selection-summary', filters.year === 'todos' ? '2020 – 2026' : filters.year);
  setText('#chart-total', fmt.format(total));
  setText('#trend-chip', filters.year === 'todos' ? 'Por año' : 'Por mes');
  renderTrend(data, filters.year !== 'todos'); renderCategories(data); renderRegions(data);
  const summary = summarize(data);
  setText('#insight-total', fmt.format(total));
  setText('#top-category', summary.category?.label || 'Sin datos');
  setText('#top-region', summary.region?.label || 'Sin datos');
  const share = item => item && total ? `${(item.value / total * 100).toFixed(1).replace('.', ',')} % de la selección` : 'Sin datos para la selección';
  setText('#top-category-share', share(summary.category));
  setText('#top-region-share', share(summary.region));
}
[yearSelect, regionSelect, categorySelect].forEach(select => select.addEventListener('change', render));
document.querySelector('#reset').addEventListener('click', () => { [yearSelect, regionSelect, categorySelect].forEach(select => { select.value = 'todos'; }); render(); });
document.querySelectorAll('.side-nav a').forEach(link => link.addEventListener('click', () => { document.querySelectorAll('.side-nav a').forEach(item => item.classList.remove('active')); link.classList.add('active'); }));
function addChatMessage(text, kind) {
  const message = document.createElement('div');
  message.className = `chat-message ${kind}-message`;
  message.textContent = text;
  const container = document.querySelector('#chat-messages');
  container.append(message);
  container.scrollTop = container.scrollHeight;
}
function ask(question) {
  if (!question.trim()) return;
  addChatMessage(question.trim(), 'user');
  addChatMessage(answerQuestion(question, currentData()), 'bot');
}
document.querySelector('#chat-form').addEventListener('submit', event => {
  event.preventDefault();
  const input = document.querySelector('#chat-input');
  ask(input.value); input.value = '';
});
document.querySelectorAll('[data-question]').forEach(button => button.addEventListener('click', () => ask(button.dataset.question)));
function download(type) {
  const blob = new Blob([demoCsv(currentData(), type)], {type: 'text/csv;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url;
  link.download = type === 'summary' ? 'resumen-categorias-simuladas.csv' : 'datos-simulados-filtrados.csv';
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
document.querySelector('#download-data').addEventListener('click', () => download('data'));
document.querySelector('#download-summary').addEventListener('click', () => download('summary'));
render();
