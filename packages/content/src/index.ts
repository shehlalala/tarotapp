/**
 * @tarot/content — the single source of truth for card content.
 *
 * Both apps/mobile (Metro) and apps/web (Vite/Astro) import this TypeScript
 * source directly; there is no build step.
 */
import brandJson from '../brand.json';
import cardsJson from '../data/cards.json';
import spreadsJson from '../data/spreads.json';
import suitsJson from '../data/suits.json';
import enCommon from '../data/locales/en/common.json';
import enMajor from '../data/locales/en/major.json';
import enWands from '../data/locales/en/wands.json';
import enCups from '../data/locales/en/cups.json';
import enSwords from '../data/locales/en/swords.json';
import enPentacles from '../data/locales/en/pentacles.json';
import { cardImages } from './images.generated.ts';
import type {
  Brand,
  Card,
  CardImage,
  CardFacts,
  CardGroup,
  CardText,
  CommonTextFile,
  Locale,
  PositionId,
  Spread,
  Suit,
  SuitInfo,
} from './types.ts';

export type * from './types.ts';

export const brand = brandJson as Brand;

interface LocaleBundle {
  common: CommonTextFile;
  cards: Record<CardGroup, Record<string, CardText>>;
}

/** To add a locale: create data/locales/<locale>/*.json and register it here. */
const locales: Partial<Record<Locale, LocaleBundle>> = {
  en: {
    common: enCommon as CommonTextFile,
    cards: {
      major: enMajor.cards as Record<string, CardText>,
      wands: enWands.cards as Record<string, CardText>,
      cups: enCups.cards as Record<string, CardText>,
      swords: enSwords.cards as Record<string, CardText>,
      pentacles: enPentacles.cards as Record<string, CardText>,
    },
  },
};

export const availableLocales = Object.keys(locales) as Locale[];

const facts = cardsJson.cards as CardFacts[];
const factsById = new Map(facts.map((f) => [f.id, f]));

export const spreads = spreadsJson.spreads as Spread[];
export const suits = suitsJson.suits as SuitInfo[];

export const DECK_SIZE = 78;

function bundle(locale: Locale): LocaleBundle {
  const b = locales[locale];
  if (!b) throw new Error(`@tarot/content: locale "${locale}" is not available`);
  return b;
}

const cache = new Map<Locale, Card[]>();

/** All 78 cards in canonical deck order. */
export function getCards(locale: Locale = brand.defaultLocale): Card[] {
  const cached = cache.get(locale);
  if (cached) return cached;
  const { cards } = bundle(locale);
  const merged = facts.map((f): Card => {
    const text = cards[f.suit ?? 'major'][f.id];
    if (!text) throw new Error(`@tarot/content: no ${locale} text for card "${f.id}"`);
    return { ...f, ...text, locale };
  });
  cache.set(locale, merged);
  return merged;
}

export function getCard(id: string, locale: Locale = brand.defaultLocale): Card | undefined {
  const f = factsById.get(id);
  return f ? getCards(locale)[f.order] : undefined;
}

export function getCardIds(): string[] {
  return facts.map((f) => f.id);
}

export function getCardsBySuit(suit: Suit | null, locale: Locale = brand.defaultLocale): Card[] {
  return getCards(locale).filter((c) => c.suit === suit);
}

export function getSpread(id: string): Spread | undefined {
  return spreads.find((s) => s.id === id);
}

export function getCommonText(locale: Locale = brand.defaultLocale): CommonTextFile {
  return bundle(locale).common;
}

export function getPositionLabel(position: PositionId, locale: Locale = brand.defaultLocale): string {
  for (const spread of Object.values(bundle(locale).common.spreads)) {
    const p = spread.positions[position];
    if (p) return p.label;
  }
  return position;
}

/**
 * Related cards: the editorial list if set, otherwise the neighbours in the
 * same suit (or the adjacent major arcana).
 */
export function getRelatedCards(id: string, locale: Locale = brand.defaultLocale, count = 3): Card[] {
  const card = getCard(id, locale);
  if (!card) return [];
  if (card.related.length > 0) {
    return card.related.flatMap((r) => getCard(r, locale) ?? []).slice(0, count);
  }
  const group = getCardsBySuit(card.suit, locale);
  const i = group.findIndex((c) => c.id === id);
  const out: Card[] = [];
  for (let step = 1; out.length < count && step < group.length; step++) {
    const next = group[(i + step) % group.length];
    const prev = group[(i - step + group.length) % group.length];
    if (next && !out.includes(next)) out.push(next);
    if (out.length < count && prev && !out.includes(prev)) out.push(prev);
  }
  return out;
}

/** True when text is safe to publish (not scaffold text). */
export function isPublishable(card: Pick<CardText, 'status'>): boolean {
  return card.status !== 'placeholder';
}

/**
 * Bundled image for a card, or undefined when the card has none yet (callers
 * then draw a typographic placeholder).
 */
export function getCardImage(id: string): CardImage | undefined {
  return cardImages[id];
}
