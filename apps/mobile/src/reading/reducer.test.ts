import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canReveal, createReading, readingReducer, shuffle, type ReadingState, type Rng } from './reducer.ts';

/** Deterministic rng (mulberry32) so tests are repeatable. */
function seeded(seed: number): Rng {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const IDS = Array.from({ length: 78 }, (_, i) => `card-${i}`);
const fresh = (seed = 1) => createReading(IDS, 3, seeded(seed));
const pick = (s: ReadingState, id: string) => readingReducer(s, { type: 'pick', id });

test('shuffle is a deterministic permutation', () => {
  const a = shuffle(IDS, seeded(42));
  assert.deepEqual(a, shuffle(IDS, seeded(42)));
  assert.notDeepEqual(a, IDS);
  assert.deepEqual([...a].sort(), [...IDS].sort());
});

test('a new reading has empty slots, a full deck and mixed orientations', () => {
  const s = fresh();
  assert.deepEqual(s.slots, [null, null, null]);
  assert.equal(s.deck.length, 78);
  assert.equal(s.phase, 'selecting');
  const reversed = Object.values(s.orientation).filter((o) => o === 'reversed').length;
  assert.ok(reversed > 15 && reversed < 63, `expected a mix of orientations, got ${reversed} reversed`);
});

test('picks fill slots in order and a fourth pick is ignored', () => {
  let s = fresh();
  const [a, b, c, d] = s.deck as [string, string, string, string];
  s = pick(s, a);
  s = pick(s, b);
  assert.deepEqual(s.slots, [a, b, null]);
  s = pick(s, c);
  const full = s;
  s = pick(s, d);
  assert.equal(s, full);
  assert.deepEqual(s.slots, [a, b, c]);
});

test('picking the same card twice or an unknown card is ignored', () => {
  let s = pick(fresh(), 'card-5');
  const once = s;
  s = pick(s, 'card-5');
  assert.equal(s, once);
  s = pick(s, 'not-a-card');
  assert.equal(s, once);
});

test('unslot returns the card and the next pick fills the gap', () => {
  let s = fresh();
  s = pick(pick(pick(s, 'card-1'), 'card-2'), 'card-3');
  s = readingReducer(s, { type: 'unslot', index: 1 });
  assert.deepEqual(s.slots, ['card-1', null, 'card-3']);
  s = pick(s, 'card-9');
  assert.deepEqual(s.slots, ['card-1', 'card-9', 'card-3']);
});

test('orientation survives unslot and re-pick', () => {
  let s = fresh(7);
  const before = s.orientation['card-4'];
  s = pick(s, 'card-4');
  s = readingReducer(s, { type: 'unslot', index: 0 });
  s = pick(s, 'card-4');
  assert.equal(s.orientation['card-4'], before);
});

test('reveal is blocked until every slot is full', () => {
  let s = pick(pick(fresh(), 'card-1'), 'card-2');
  assert.equal(canReveal(s), false);
  assert.equal(readingReducer(s, { type: 'reveal' }), s);
  s = pick(s, 'card-3');
  assert.equal(canReveal(s), true);
  s = readingReducer(s, { type: 'reveal' });
  assert.equal(s.phase, 'revealed');
});

test('after reveal, picks and unslots are ignored', () => {
  let s = pick(pick(pick(fresh(), 'card-1'), 'card-2'), 'card-3');
  s = readingReducer(s, { type: 'reveal' });
  assert.equal(pick(s, 'card-10'), s);
  assert.equal(readingReducer(s, { type: 'unslot', index: 0 }), s);
});

test('reset starts a new reading', () => {
  let s = pick(pick(pick(fresh(1), 'card-1'), 'card-2'), 'card-3');
  s = readingReducer(s, { type: 'reveal' });
  const next = fresh(2);
  s = readingReducer(s, { type: 'reset', state: next });
  assert.deepEqual(s.slots, [null, null, null]);
  assert.equal(s.phase, 'selecting');
  assert.notDeepEqual(s.deck, fresh(1).deck);
});
