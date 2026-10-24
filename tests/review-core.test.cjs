const { test } = require('node:test');
const assert = require('node:assert/strict');
const core = require('../assets/review-core.js');
const now = Date.UTC(2026, 0, 1);
const cards = [{ id: 'first' }, { id: 'second' }];

test('unseen cards are due; scheduled cards are due at the exact timestamp', () => {
  const states = { first: { stage: 1, due: now + 1 } };
  assert.deepEqual(core.dueCards(cards, states, now).map(card => card.id), ['second']);
  assert.equal(core.dueCards(cards, states, now + 1).length, 2);
});

test('remembered reviews progress through 1, 7, 30, then 30 days', () => {
  let state;
  for (const [index, days] of [1, 7, 30, 30].entries()) {
    state = core.rate(state, 'remembered', now);
    assert.equal(state.due, now + days * core.DAY);
    assert.equal(state.stage, Math.min(index + 1, 3));
  }
});

test('again schedules ten minutes and resets the remembered interval', () => {
  const retry = core.rate({ stage: 3, due: now }, 'again', now);
  assert.deepEqual(retry, { stage: 0, due: now + 600000 });
  assert.equal(core.rate(retry, 'remembered', now).due, now + core.DAY);
});

test('bad state is discarded without trusting unknown ids or invalid values', () => {
  assert.deepEqual(core.sanitize(null, cards), {});
  assert.deepEqual(core.sanitize([], cards), {});
  assert.deepEqual(core.sanitize({ first: { stage: -1, due: now }, second: { stage: 2, due: 'today' } }, cards), {});
  assert.deepEqual(core.sanitize({ first: { stage: 1, due: now }, unknown: { stage: 1, due: now } }, cards), { first: { stage: 1, due: now } });
  assert.equal(core.dueCards(cards, { first: { stage: 99, due: now + 1 } }, now).length, 2);
});

test('unknown ratings are rejected', () => {
  assert.throws(() => core.rate(undefined, 'mastered', now));
});
