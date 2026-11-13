import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inMidnightPause, midnightPauseRefusal } from './pause.mjs';

test('winter (UTC+2): 23:52 open, 23:53–23:59 paused, 00:00 open', () => {
  assert.equal(inMidnightPause(new Date('2026-11-13T21:52:59Z')), false);
  assert.equal(inMidnightPause(new Date('2026-11-13T21:53:00Z')), true);
  assert.equal(inMidnightPause(new Date('2026-11-13T21:59:59Z')), true);
  assert.equal(inMidnightPause(new Date('2026-11-13T22:00:00Z')), false);
});

test('summer (UTC+3): the same Kyiv 23:55 is a different UTC hour', () => {
  assert.equal(inMidnightPause(new Date('2026-07-13T20:55:00Z')), true);
  assert.equal(inMidnightPause(new Date('2026-07-13T21:55:00Z')), false);
});

test('window length and time zone are configurable', () => {
  const at = new Date('2026-11-13T21:45:00Z'); // 23:45 in Kyiv
  assert.equal(inMidnightPause(at), false);
  assert.equal(inMidnightPause(at, { minutes: 15 }), true);
  assert.equal(inMidnightPause(at, { timeZone: 'UTC' }), false);
});

test('refusal carries a public code and a sentence the customer can act on', () => {
  const refusal = midnightPauseRefusal();
  assert.equal(refusal.status, 409);
  assert.equal(refusal.code, 'CHECKOUT_MIDNIGHT_PAUSE');
  assert.match(refusal.message, /after 00:00/);
});
