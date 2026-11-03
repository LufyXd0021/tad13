import test from 'node:test';
import assert from 'node:assert/strict';
import {makeDemoData, filterRows, sum, summarize, demoCsv} from '../data.js';

const rows = makeDemoData();
const filters = {year: '2026', region: 'Atlántico', category: 'Hurto'};
const selection = filterRows(rows, filters);

test('los filtros seleccionan únicamente las filas correspondientes', () => {
  assert.equal(selection.length, 12);
  assert.ok(selection.every(row => row.year === 2026 && row.region === 'Atlántico' && row.category === 'Hurto'));
  assert.equal(filterRows(rows, {year: 'todos', region: 'todos', category: 'todos'}).length, 3528);
});
test('los resúmenes reflejan la selección', () => {
  const result = summarize(selection);
  assert.equal(result.total, sum(selection));
  assert.equal(result.category.label, 'Hurto');
  assert.equal(result.region.label, 'Atlántico');
  assert.equal(summarize([]).total, 0);
});
test('las descargas identifican datos simulados y respetan la selección', () => {
  const csv = demoCsv(selection, 'data');
  assert.ok(csv.startsWith('\uFEFF'));
  assert.equal(csv.trim().split('\r\n').length, 13);
  assert.match(csv, /"SIMULADO","2026","1","Atlántico","Hurto"/);
  const summary = demoCsv(selection, 'summary');
  assert.match(summary, /"SIMULADO","Hurto","\d+","100\.00"/);
  assert.doesNotMatch(summary, /Lesiones/);
});
test('los campos CSV no se interpretan como fórmulas de hoja de cálculo', () => {
  const csv = demoCsv([{year: 2026, month: 1, region: '=1+1', category: '"texto"', count: 3}], 'data');
  assert.match(csv, /"'=1\+1"/);
  assert.match(csv, /"""texto"""/);
});
