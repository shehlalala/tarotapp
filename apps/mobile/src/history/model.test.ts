import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MAX_READINGS, addReading, newReadingId, parseHistory, type SavedReading } from './model.ts';

const reading = (id: string, date = '2026-10-01T10:00:00.000Z'): SavedReading => ({
  id,
  date,
  spreadId: 'past-present-future',
  cards: [
    { id: 'the-tower', position: 'past', orientation: 'upright' },
    { id: 'ace-of-cups', position: 'present', orientation: 'reversed' },
    { id: 'the-star', position: 'future', orientation: 'upright' },
  ],
});

test('addReading puts the newest first and caps the list', () => {
  let list: SavedReading[] = [];
  for (let i = 0; i < MAX_READINGS + 5; i++) list = addReading(list, reading(`r${i}`));
  assert.equal(list.length, MAX_READINGS);
  assert.equal(list[0]!.id, `r${MAX_READINGS + 4}`);
});

test('addReading replaces an entry with the same id', () => {
  const list = addReading(addReading([], reading('a')), reading('a', '2026-10-02T00:00:00.000Z'));
  assert.equal(list.length, 1);
  assert.equal(list[0]!.date, '2026-10-02T00:00:00.000Z');
});

test('parseHistory round-trips valid data', () => {
  const list = [reading('a'), reading('b')];
  assert.deepEqual(parseHistory(JSON.stringify(list)), list);
});

test('parseHistory survives corrupt or missing storage', () => {
  assert.deepEqual(parseHistory(null), []);
  assert.deepEqual(parseHistory('{not json'), []);
  assert.deepEqual(parseHistory('{"a":1}'), []);
});

test('parseHistory drops malformed entries and unknown cards', () => {
  const bad = { ...reading('bad'), cards: [{ id: 'x', position: 'sideways', orientation: 'upright' }] };
  const unknown = { ...reading('old'), cards: [{ id: 'retired-card', position: 'past', orientation: 'upright' }] };
  const raw = JSON.stringify([reading('ok'), bad, unknown, 42, { id: 'no-date' }]);
  const ids = new Set(['the-tower', 'ace-of-cups', 'the-star']);
  assert.deepEqual(parseHistory(raw, ids).map((r) => r.id), ['ok']);
});

test('reading ids are unique for different random draws', () => {
  const now = new Date('2026-10-02T12:00:00Z');
  assert.notEqual(newReadingId(now, () => 0.1), newReadingId(now, () => 0.2));
});
