/**
 * Scaffolds data/cards.json and data/locales/en/*.json with placeholder text.
 *
 * Safe to re-run: it only ADDS missing cards. Existing card facts and text are
 * never overwritten, so it cannot clobber drafted or reviewed content.
 *
 *   pnpm --filter @tarot/content placeholders
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type {
  CardFacts,
  CardFactsFile,
  CardGroup,
  CardText,
  CardTextFile,
  PositionMeaning,
  Rank,
  Suit,
} from '../src/types.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(root, 'data');

// Rider-Waite-Smith order and numbering, with Golden Dawn correspondences.
const MAJORS: Array<[id: string, name: string, astrology: string]> = [
  ['the-fool', 'The Fool', 'Air'],
  ['the-magician', 'The Magician', 'Mercury'],
  ['the-high-priestess', 'The High Priestess', 'Moon'],
  ['the-empress', 'The Empress', 'Venus'],
  ['the-emperor', 'The Emperor', 'Aries'],
  ['the-hierophant', 'The Hierophant', 'Taurus'],
  ['the-lovers', 'The Lovers', 'Gemini'],
  ['the-chariot', 'The Chariot', 'Cancer'],
  ['strength', 'Strength', 'Leo'],
  ['the-hermit', 'The Hermit', 'Virgo'],
  ['wheel-of-fortune', 'Wheel of Fortune', 'Jupiter'],
  ['justice', 'Justice', 'Libra'],
  ['the-hanged-man', 'The Hanged Man', 'Water'],
  ['death', 'Death', 'Scorpio'],
  ['temperance', 'Temperance', 'Sagittarius'],
  ['the-devil', 'The Devil', 'Capricorn'],
  ['the-tower', 'The Tower', 'Mars'],
  ['the-star', 'The Star', 'Aquarius'],
  ['the-moon', 'The Moon', 'Pisces'],
  ['the-sun', 'The Sun', 'Sun'],
  ['judgement', 'Judgement', 'Fire'],
  ['the-world', 'The World', 'Saturn'],
];

const SUITS: Suit[] = ['wands', 'cups', 'swords', 'pentacles'];

const RANKS: Rank[] = [
  'ace', 'two', 'three', 'four', 'five', 'six', 'seven',
  'eight', 'nine', 'ten', 'page', 'knight', 'queen', 'king',
];

const pad = (n: number) => String(n).padStart(2, '0');
const capitalize = (s: string) => s[0]!.toUpperCase() + s.slice(1);

function buildFacts(): CardFacts[] {
  const facts: CardFacts[] = [];
  MAJORS.forEach(([id, , astrology], number) => {
    facts.push({
      id,
      arcana: 'major',
      number,
      suit: null,
      rank: null,
      order: facts.length,
      image: `major/${pad(number)}-${id}`,
      astrology,
      related: [],
    });
  });
  for (const suit of SUITS) {
    RANKS.forEach((rank, i) => {
      const id = `${rank}-of-${suit}`;
      facts.push({
        id,
        arcana: 'minor',
        number: i + 1,
        suit,
        rank,
        order: facts.length,
        image: `${suit}/${pad(i + 1)}-${id}`,
        astrology: null,
        related: [],
      });
    });
  }
  return facts;
}

function cardName(f: CardFacts): string {
  if (f.arcana === 'major') return MAJORS[f.number]![1];
  return `${capitalize(f.rank!)} of ${capitalize(f.suit!)}`;
}

function placeholderText(f: CardFacts): CardText {
  const name = cardName(f);
  const ph = (what: string) => `[PLACEHOLDER] ${what} for ${name}.`;
  const position = (label: string): PositionMeaning => ({
    upright: { short: ph(`Short upright ${label} meaning`), long: ph(`Long upright ${label} meaning`) },
    reversed: { short: ph(`Short reversed ${label} meaning`), long: ph(`Long reversed ${label} meaning`) },
  });
  return {
    status: 'placeholder',
    name,
    imageAlt: `${name} tarot card from the Rider-Waite-Smith deck (placeholder artwork).`,
    summary: ph('A 40 to 60 word direct answer to "what does this card mean in tarot"'),
    keywords: { upright: ['placeholder'], reversed: ['placeholder'] },
    upright: ph('Upright meaning'),
    reversed: ph('Reversed meaning'),
    positions: {
      past: position('Past'),
      present: position('Present'),
      future: position('Future'),
    },
    symbolism: ph('Symbolism of the artwork'),
    faq: [
      { question: `What does ${name} mean in tarot?`, answer: ph('FAQ answer') },
      { question: `Is ${name} a yes or no card?`, answer: ph('FAQ answer') },
      { question: `What does ${name} mean in a love reading?`, answer: ph('FAQ answer') },
    ],
  };
}

function readJson<T>(path: string, fallback: T): T {
  return existsSync(path) ? (JSON.parse(readFileSync(path, 'utf8')) as T) : fallback;
}

function writeJson(path: string, value: unknown) {
  writeFileSync(path, JSON.stringify(value, null, 2) + '\n');
}

// --- card facts ---------------------------------------------------------
const factsPath = join(dataDir, 'cards.json');
const factsFile = readJson<CardFactsFile>(factsPath, {
  $schema: '../schema/cards.schema.json',
  cards: [],
});
const existingIds = new Set(factsFile.cards.map((c) => c.id));
const allFacts = buildFacts();
let addedFacts = 0;
for (const f of allFacts) {
  if (!existingIds.has(f.id)) {
    factsFile.cards.push(f);
    addedFacts++;
  }
}
factsFile.cards.sort((a, b) => a.order - b.order);
writeJson(factsPath, factsFile);

// --- English text, one file per group ------------------------------------
const groups: CardGroup[] = ['major', ...SUITS];
let addedText = 0;
for (const group of groups) {
  const path = join(dataDir, 'locales', 'en', `${group}.json`);
  const file = readJson<CardTextFile>(path, {
    $schema: '../../../schema/card-text.schema.json',
    cards: {},
  });
  for (const f of allFacts) {
    const fGroup: CardGroup = f.suit ?? 'major';
    if (fGroup !== group || file.cards[f.id]) continue;
    file.cards[f.id] = placeholderText(f);
    addedText++;
  }
  writeJson(path, file);
}

console.log(`cards.json: +${addedFacts} cards; locales/en: +${addedText} card texts.`);
