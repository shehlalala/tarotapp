/**
 * Reading history: pure helpers (no storage, no React) so they are unit tested.
 * Persistence lives in storage.ts.
 */
import type { Orientation, PositionId } from '@tarot/content';

export interface SavedCard {
  id: string;
  position: PositionId;
  orientation: Orientation;
}

export interface SavedReading {
  id: string;
  /** ISO 8601 timestamp. */
  date: string;
  spreadId: string;
  cards: SavedCard[];
}

export const MAX_READINGS = 100;

/** Newest first, capped at MAX_READINGS, no duplicate ids. */
export function addReading(list: readonly SavedReading[], reading: SavedReading): SavedReading[] {
  return [reading, ...list.filter((r) => r.id !== reading.id)].slice(0, MAX_READINGS);
}

const POSITIONS = new Set(['past', 'present', 'future']);
const ORIENTATIONS = new Set(['upright', 'reversed']);

function isSavedReading(v: unknown): v is SavedReading {
  if (typeof v !== 'object' || v === null) return false;
  const r = v as Record<string, unknown>;
  return (
    typeof r.id === 'string' &&
    typeof r.date === 'string' &&
    !Number.isNaN(Date.parse(r.date)) &&
    typeof r.spreadId === 'string' &&
    Array.isArray(r.cards) &&
    r.cards.every((c: unknown) => {
      const card = c as Record<string, unknown>;
      return (
        typeof c === 'object' &&
        c !== null &&
        typeof card.id === 'string' &&
        POSITIONS.has(card.position as string) &&
        ORIENTATIONS.has(card.orientation as string)
      );
    })
  );
}

/**
 * Parses stored JSON. Never throws: corrupt storage yields an empty history,
 * and individual malformed entries (or cards no longer in the deck) are dropped.
 */
export function parseHistory(raw: string | null, knownCardIds?: ReadonlySet<string>): SavedReading[] {
  if (!raw) return [];
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];
  return data
    .filter(isSavedReading)
    .filter((r) => !knownCardIds || r.cards.every((c) => knownCardIds.has(c.id)))
    .slice(0, MAX_READINGS);
}

export function newReadingId(now: Date, rng: () => number = Math.random): string {
  return `${now.getTime().toString(36)}-${Math.floor(rng() * 1e9).toString(36)}`;
}
