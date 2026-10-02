/**
 * Shared types for card content. Used by apps/mobile and apps/web.
 *
 * Content is split in two layers:
 *  - CardFacts: language-neutral facts (id, numbering, suit, image). data/cards.json
 *  - CardText:  everything a translator touches. data/locales/<locale>/<group>.json
 * A `Card` is the two merged for one locale.
 */

export type Locale = 'en' | 'az' | 'tr' | 'ru';

export type Arcana = 'major' | 'minor';

export type Suit = 'wands' | 'cups' | 'swords' | 'pentacles';

export type Element = 'fire' | 'water' | 'air' | 'earth';

export type Rank =
  | 'ace'
  | 'two'
  | 'three'
  | 'four'
  | 'five'
  | 'six'
  | 'seven'
  | 'eight'
  | 'nine'
  | 'ten'
  | 'page'
  | 'knight'
  | 'queen'
  | 'king';

/** Locale files are grouped so each one stays a reviewable size. */
export type CardGroup = 'major' | Suit;

/** Positions a card can occupy in a spread. Extend when new spreads are added. */
export type PositionId = 'past' | 'present' | 'future';

/**
 * Editorial state of a card's text in one locale.
 *  - placeholder: scaffold text, not for publishing
 *  - draft:       AI- or human-written first draft, awaiting review
 *  - reviewed:    approved by a human editor
 */
export type ContentStatus = 'placeholder' | 'draft' | 'reviewed';

export interface CardFacts {
  /** Stable id, also the URL slug: `/cards/<id>`. Never change once published. */
  id: string;
  arcana: Arcana;
  /** Major: 0–21 (Rider-Waite-Smith numbering, Strength = 8, Justice = 11). Minor: 1–14 (Ace = 1, King = 14). */
  number: number;
  /** Minor arcana only. */
  suit: Suit | null;
  /** Minor arcana only. */
  rank: Rank | null;
  /** 0–77, canonical deck order (majors, then wands, cups, swords, pentacles). */
  order: number;
  /** Image path relative to packages/content/images, without extension. */
  image: string;
  /** Traditional (Golden Dawn) astrological correspondence. Major arcana only. */
  astrology: string | null;
  /** Editorially chosen related card ids. Empty means "let the consumer pick". */
  related: string[];
}

/** Readings draw cards at random orientation. */
export type Orientation = 'upright' | 'reversed';

export interface PositionText {
  /** One or two sentences. Shown on the reveal screen in the app. */
  short: string;
  /** A paragraph. Shown in the app detail view and on the website. */
  long: string;
}

/** What a card means in one spread position, for each orientation. */
export type PositionMeaning = Record<Orientation, PositionText>;

export interface FaqItem {
  question: string;
  answer: string;
}

export interface CardText {
  status: ContentStatus;
  name: string;
  /** Descriptive alt text for the card image. */
  imageAlt: string;
  /** 40–60 word direct answer to "What does <card> mean in tarot?". Must stand alone. */
  summary: string;
  keywords: {
    upright: string[];
    reversed: string[];
  };
  upright: string;
  reversed: string;
  positions: Record<PositionId, PositionMeaning>;
  symbolism: string;
  /** 3–5 questions people actually ask about this card. */
  faq: FaqItem[];
}

/** Shape of data/locales/<locale>/<group>.json */
export interface CardTextFile {
  $schema?: string;
  cards: Record<string, CardText>;
}

/** Shape of data/cards.json */
export interface CardFactsFile {
  $schema?: string;
  cards: CardFacts[];
}

export type Card = CardFacts & CardText & { locale: Locale };

export interface SpreadPosition {
  id: PositionId;
}

export interface Spread {
  id: string;
  positions: SpreadPosition[];
}

export interface SpreadText {
  name: string;
  description: string;
  positions: Record<PositionId, { label: string; description: string }>;
}

export interface SuitInfo {
  id: Suit;
  element: Element;
}

export interface SuitText {
  name: string;
  description: string;
}

/** Shape of data/locales/<locale>/common.json */
export interface CommonTextFile {
  $schema?: string;
  arcana: Record<Arcana, { name: string; description: string }>;
  suits: Record<Suit, SuitText>;
  ranks: Record<Rank, string>;
  spreads: Record<string, SpreadText>;
  orientation: { upright: string; reversed: string };
}

export interface Brand {
  appName: string;
  tagline: string;
  domain: string;
  siteUrl: string;
  iosBundleId: string;
  androidPackage: string;
  appStoreId: string | null;
  appStoreUrl: string | null;
  developerName: string;
  contactEmail: string;
  defaultLocale: Locale;
  locales: Locale[];
  plannedLocales: Locale[];
}
