// Datos sintéticos deterministas: no derivan de cifras ni fuentes reales.
export const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026];
export const regions = ['Antioquia', 'Atlántico', 'Bogotá D.C.', 'Bolívar', 'Cundinamarca', 'Santander', 'Valle del Cauca'];
export const categories = ['Hurto', 'Lesiones', 'Violencia intrafamiliar', 'Homicidio', 'Extorsión', 'Otros'];
export const colors = ['#1c6a54', '#a9cbad', '#dfb66d', '#8c9eb3', '#c7aeb4', '#d9dfd2'];
export const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export function makeDemoData() {
  const rows = [];
  years.forEach((year, yi) => regions.forEach((region, ri) => categories.forEach((category, ci) => months.forEach((_, mi) => {
    const noise = ((yi * 29 + ri * 17 + ci * 13 + mi * 7) % 31);
    const count = Math.max(3, Math.round((116 - ri * 8) * (1 - ci * 0.125) * (0.78 + yi * 0.045) + noise - mi % 4 * 3));
    rows.push({year, month: mi + 1, region, category, count});
  }))));
  return rows;
}

export function filterRows(rows, filters) {
  return rows.filter(row => (filters.year === 'todos' || row.year === Number(filters.year)) &&
    (filters.region === 'todos' || row.region === filters.region) &&
    (filters.category === 'todos' || row.category === filters.category));
}
export function sum(rows) { return rows.reduce((total, row) => total + row.count, 0); }
export function grouped(rows, key, labels) {
  return labels.map(label => ({label, value: sum(rows.filter(row => row[key] === label))}));
}

export function summarize(data) {
  const total = sum(data);
  const top = (key, labels) => grouped(data, key, labels).filter(item => item.value > 0).sort((a, b) => b.value - a.value)[0];
  return {total, category: top('category', categories), region: top('region', regions)};
}

function csvCell(value) {
  let text = String(value);
  if (/^[\s]*[=+@-]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}
export function demoCsv(data, type) {
  const header = type === 'summary'
    ? ['tipo_de_dato', 'categoria', 'registros_simulados', 'porcentaje_de_seleccion']
    : ['tipo_de_dato', 'anio', 'mes', 'territorio', 'categoria', 'registros_simulados'];
  const total = sum(data);
  const body = type === 'summary'
    ? grouped(data, 'category', categories).filter(item => item.value > 0).map(item => ['SIMULADO', item.label, item.value, total ? (item.value / total * 100).toFixed(2) : '0.00'])
    : data.map(row => ['SIMULADO', row.year, row.month, row.region, row.category, row.count]);
  return '\uFEFF' + [header, ...body].map(row => row.map(csvCell).join(',')).join('\r\n') + '\r\n';
}
