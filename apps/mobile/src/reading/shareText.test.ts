import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildShareText } from './shareText.ts';

test('share text lists each position, marks reversed cards, and ends with the footer', () => {
  const text = buildShareText(
    'My tarot reading',
    [
      { position: 'Past', name: 'The Tower', reversedNote: null, meaning: 'A shake-up cleared the ground.' },
      { position: 'Present', name: 'Ace of Cups', reversedNote: 'reversed', meaning: 'Feelings held back.' },
    ],
    'Drawn with Tarot · https://example.com',
  );
  assert.equal(
    text,
    'My tarot reading\n\nPast: The Tower\nA shake-up cleared the ground.\n\nPresent: Ace of Cups (reversed)\nFeelings held back.\n\nDrawn with Tarot · https://example.com',
  );
});
