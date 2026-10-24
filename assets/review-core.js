/* Pure review policy, usable in a browser and Node tests. Ratings are not mastery. */
(function (root) {
  'use strict';
  const DAY = 24 * 60 * 60 * 1000;
  const intervals = [DAY, 7 * DAY, 30 * DAY];
  function validState(value) {
    return value && typeof value === 'object' && Number.isInteger(value.stage) &&
      value.stage >= 0 && value.stage <= 3 && Number.isFinite(value.due) && value.due >= 0;
  }
  function sanitize(raw, cards) {
    const result = {};
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return result;
    for (const card of cards) {
      if (Object.hasOwn(raw, card.id) && validState(raw[card.id])) {
        result[card.id] = { stage: raw[card.id].stage, due: raw[card.id].due };
      }
    }
    return result;
  }
  function dueCards(cards, states, now) {
    return cards.filter(card => !validState(states[card.id]) || states[card.id].due <= now);
  }
  function rate(previous, rating, now) {
    if (!['again', 'remembered'].includes(rating)) throw new Error('Unknown rating');
    if (rating === 'again') return { stage: 0, due: now + 10 * 60 * 1000 };
    const stage = validState(previous) ? previous.stage : 0;
    return { stage: Math.min(stage + 1, 3), due: now + intervals[Math.min(stage, 2)] };
  }
  const api = { DAY, sanitize, dueCards, rate };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ReviewCore = api;
})(typeof window !== 'undefined' ? window : globalThis);
