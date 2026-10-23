import test from 'node:test';
import assert from 'node:assert/strict';
import { parseServiceInput, slugify, uniqueSlug } from '../lib/services.ts';

const base = { category: 'facial', name: { es: 'Facial profundo' }, price: 2000 };

test('a minimal service is valid and defaults to shown', () => {
  const parsed = parseServiceInput(base);
  assert.equal(parsed.ok, true);
  assert.deepEqual(parsed.value, { ...base, display: null, note: null, active: true });
});

test('service validation names the field that is wrong', () => {
  const cases = [
    [{ ...base, name: { es: '  ' } }, 'name.es'],
    [{ ...base, name: undefined }, 'name.es'],
    [{ ...base, name: { es: 'x'.repeat(61) } }, 'name.es'],
    [{ ...base, price: 12.5 }, 'price'],
    [{ ...base, price: -1 }, 'price'],
    [{ ...base, price: '2000' }, 'price'],
    [{ ...base, price: null }, 'price'],
    [{ ...base, category: 'unas' }, 'category'],
    [{ ...base, note: { en: 'Women only' } }, 'note.es'],
    [{ ...base, active: 'yes' }, 'active'],
  ];
  for (const [input, field] of cases) {
    const parsed = parseServiceInput(input);
    assert.equal(parsed.ok, false, JSON.stringify(input));
    assert.ok(field in parsed.issues, `${field} in ${JSON.stringify(parsed.issues)}`);
  }
});

test('blank optional texts are dropped and English is optional', () => {
  const parsed = parseServiceInput({ ...base, display: { es: ' ', en: '' }, note: { es: 'Solo mujeres', en: '' } });
  assert.equal(parsed.ok, true);
  assert.equal(parsed.value.display, null);
  assert.deepEqual(parsed.value.note, { es: 'Solo mujeres' });
});

test('new slugs come from the Spanish name and never collide', () => {
  assert.equal(slugify('Depilación de cejas'), 'depilacion-de-cejas');
  assert.equal(slugify('  ¡Extensiones   de pestañas! '), 'extensiones-de-pestanas');
  assert.equal(slugify('***'), 'servicio');
  assert.ok(slugify('a '.repeat(80)).length <= 60 && !slugify('a '.repeat(80)).endsWith('-'));
  assert.equal(uniqueSlug('cejas', new Set(['cejas', 'cejas-2'])), 'cejas-3');
  assert.equal(uniqueSlug('labios', new Set(['cejas'])), 'labios');
});
