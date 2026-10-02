/**
 * Validates the content package. Zero dependencies; runs on plain Node (>=22.18).
 *
 *   pnpm validate
 *
 * Errors fail the run. Warnings flag editorial issues (summary length,
 * placeholder text) without failing, so work in progress stays buildable.
 * Pass --strict to treat warnings as errors (use before a release).
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { CardFactsFile, CardGroup, CardText, CardTextFile, CommonTextFile } from '../src/types.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(root, 'data');
const strict = process.argv.includes('--strict');

const errors: string[] = [];
const warnings: string[] = [];
const err = (m: string) => errors.push(m);
const warn = (m: string) => warnings.push(m);

const readJson = <T>(path: string): T => JSON.parse(readFileSync(path, 'utf8')) as T;
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

const GROUPS: CardGroup[] = ['major', 'wands', 'cups', 'swords', 'pentacles'];
const RANKS = ['ace', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'page', 'knight', 'queen', 'king'];
const POSITIONS = ['past', 'present', 'future'] as const;
const ORIENTATIONS = ['upright', 'reversed'] as const;

// --- facts ---------------------------------------------------------------
const { cards } = readJson<CardFactsFile>(join(dataDir, 'cards.json'));
const ids = new Set<string>();

if (cards.length !== 78) err(`cards.json: expected 78 cards, found ${cards.length}`);

cards.forEach((c, i) => {
  const at = `cards.json[${i}] ${c.id}`;
  if (ids.has(c.id)) err(`${at}: duplicate id`);
  ids.add(c.id);
  if (!/^[a-z]+(-[a-z]+)*$/.test(c.id)) err(`${at}: id must be a lowercase-hyphenated slug`);
  if (c.order !== i) err(`${at}: order is ${c.order}, expected ${i}`);
  if (c.arcana === 'major') {
    if (c.suit !== null || c.rank !== null) err(`${at}: major arcana must have suit and rank null`);
    if (c.number !== i) err(`${at}: major number is ${c.number}, expected ${i}`);
  } else {
    if (!c.suit || !c.rank) err(`${at}: minor arcana needs suit and rank`);
    if (c.rank && RANKS.indexOf(c.rank) + 1 !== c.number) err(`${at}: number ${c.number} does not match rank ${c.rank}`);
    if (c.id !== `${c.rank}-of-${c.suit}`) err(`${at}: id should be "${c.rank}-of-${c.suit}"`);
  }
  const group = c.suit ?? 'major';
  if (!c.image.startsWith(`${group}/`)) err(`${at}: image should live under "${group}/"`);
});

for (const c of cards) {
  for (const r of c.related) {
    if (!ids.has(r)) err(`cards.json ${c.id}: related card "${r}" does not exist`);
    if (r === c.id) err(`cards.json ${c.id}: card lists itself as related`);
  }
}

const count = (pred: (c: (typeof cards)[number]) => boolean) => cards.filter(pred).length;
if (count((c) => c.arcana === 'major') !== 22) err('cards.json: expected 22 major arcana');
for (const s of GROUPS.slice(1)) {
  if (count((c) => c.suit === s) !== 14) err(`cards.json: expected 14 cards in ${s}`);
}

// --- locale text ---------------------------------------------------------
const localesDir = join(dataDir, 'locales');
const statusTally: Record<string, number> = {};

for (const locale of readdirSync(localesDir)) {
  const seen = new Set<string>();

  const commonPath = join(localesDir, locale, 'common.json');
  if (!existsSync(commonPath)) err(`locales/${locale}: missing common.json`);
  else {
    const common = readJson<CommonTextFile>(commonPath);
    for (const r of RANKS) if (!common.ranks?.[r as keyof CommonTextFile['ranks']]) err(`locales/${locale}/common.json: missing rank "${r}"`);
  }

  for (const group of GROUPS) {
    const path = join(localesDir, locale, `${group}.json`);
    const where = `locales/${locale}/${group}.json`;
    if (!existsSync(path)) {
      err(`${where}: missing file`);
      continue;
    }
    const file = readJson<CardTextFile>(path);
    for (const [id, t] of Object.entries(file.cards)) {
      const at = `${where} ${id}`;
      const fact = cards.find((c) => c.id === id);
      if (!fact) {
        err(`${at}: no such card in cards.json`);
        continue;
      }
      if ((fact.suit ?? 'major') !== group) err(`${at}: belongs in ${fact.suit ?? 'major'}.json`);
      seen.add(id);
      checkText(at, t);
      statusTally[`${locale}:${t.status}`] = (statusTally[`${locale}:${t.status}`] ?? 0) + 1;
    }
  }

  for (const id of ids) if (!seen.has(id)) err(`locales/${locale}: no text for card "${id}"`);
}

function checkText(at: string, t: CardText) {
  if (!['placeholder', 'draft', 'reviewed'].includes(t.status)) err(`${at}: invalid status "${t.status}"`);

  const required: Array<[string, unknown]> = [
    ['name', t.name],
    ['imageAlt', t.imageAlt],
    ['summary', t.summary],
    ['upright', t.upright],
    ['reversed', t.reversed],
    ['symbolism', t.symbolism],
  ];
  for (const p of POSITIONS) {
    for (const o of ORIENTATIONS) {
      required.push([`positions.${p}.${o}.short`, t.positions?.[p]?.[o]?.short]);
      required.push([`positions.${p}.${o}.long`, t.positions?.[p]?.[o]?.long]);
    }
  }
  for (const [field, value] of required) {
    if (typeof value !== 'string' || value.trim() === '') err(`${at}: "${field}" is empty`);
  }
  if (!t.keywords?.upright?.length || !t.keywords?.reversed?.length) err(`${at}: keywords need upright and reversed entries`);
  if (!Array.isArray(t.faq) || t.faq.length < 3 || t.faq.length > 5) err(`${at}: faq needs 3–5 items`);

  if (t.status === 'placeholder') return; // editorial checks only apply to real text

  const json = JSON.stringify(t);
  if (json.includes('[PLACEHOLDER]')) err(`${at}: status is "${t.status}" but text still contains [PLACEHOLDER]`);
  const n = words(t.summary);
  if (n < 40 || n > 60) warn(`${at}: summary is ${n} words (target 40–60)`);
  for (const p of POSITIONS) {
    for (const o of ORIENTATIONS) {
      const s = t.positions[p][o].short;
      if (words(s) > 45) warn(`${at}: positions.${p}.${o}.short is ${words(s)} words (keep it short for the reveal screen)`);
    }
  }
}

// --- report --------------------------------------------------------------
const placeholders = Object.entries(statusTally).filter(([k]) => k.endsWith(':placeholder'));
for (const [k, n] of placeholders) warn(`${k.split(':')[0]}: ${n} cards still have placeholder text`);

console.log('Content status:', statusTally);
for (const w of warnings) console.warn(`warn  ${w}`);
for (const e of errors) console.error(`error ${e}`);

const failed = errors.length > 0 || (strict && warnings.length > 0);
console.log(failed ? `\n✗ ${errors.length} error(s), ${warnings.length} warning(s)` : `\n✓ content valid (${warnings.length} warning(s))`);
process.exit(failed ? 1 : 0);
