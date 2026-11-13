import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compactPlate, parsePlate, toCyrillicPlate, toLatinPlate } from './plate.mjs';

test('spaces, dashes and lower case are removed', () => {
  assert.equal(compactPlate(' aa 1234-bb '), 'AA1234BB');
});

test('Cyrillic, Latin and mixed spellings give one plate', () => {
  const cyrillic = 'АА1234ВВ';
  const latin = 'AA1234BB';
  const mixed = 'АA1234ВB'; // Cyrillic А and В mixed with Latin A and B
  for (const input of [cyrillic, latin, mixed]) assert.equal(toLatinPlate(input), latin);
  assert.equal(toCyrillicPlate(latin), cyrillic);
});

test('standard plate is recognized with its region code', () => {
  assert.deepEqual(parsePlate('ка 0001 хх'), {
    ok: true,
    kind: 'standard',
    latin: 'KA0001XX',
    cyrillic: 'КА0001ХХ',
    region: 'KA',
  });
});

test('letters outside the 12 look-alikes are not standard', () => {
  assert.equal(parsePlate('ЮЯ1234ЖЖ').kind, 'other');
  assert.equal(parsePlate('AA1234QQ').kind, 'other');
});

test('foreign and short inputs are not guessed', () => {
  assert.deepEqual(parsePlate('WA 12345'), { ok: true, kind: 'other', latin: 'WA12345' });
  assert.deepEqual(parsePlate('   '), { ok: false, reason: 'empty' });
});
