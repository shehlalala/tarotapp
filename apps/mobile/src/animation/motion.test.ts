import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FLIP_MS, flightTransform, flipDelay, flipEnd } from './motion.ts';

test('cards flip one at a time: each starts after the previous one ends', () => {
  for (let i = 1; i < 3; i++) assert.ok(flipDelay(i) >= flipEnd(i - 1));
  assert.equal(flipDelay(0), 0);
  assert.equal(flipEnd(0), FLIP_MS);
});

test('flight aligns centres and scales by width', () => {
  const from = { x: 100, y: 500, width: 60, height: 100 };
  const to = { x: 20, y: 100, width: 120, height: 200 };
  const { dx, dy, scale } = flightTransform(from, to);
  assert.equal(scale, 2);
  // Centre of `from` after translate should be the centre of `to`.
  assert.equal(from.x + from.width / 2 + dx, to.x + to.width / 2);
  assert.equal(from.y + from.height / 2 + dy, to.y + to.height / 2);
});

test('flight from a zero-size source does not divide by zero', () => {
  assert.equal(flightTransform({ x: 0, y: 0, width: 0, height: 0 }, { x: 0, y: 0, width: 10, height: 10 }).scale, 1);
});
