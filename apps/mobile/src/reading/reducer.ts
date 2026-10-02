/**
 * The reading state machine. Pure, no React, no content imports, so it runs
 * under `node --test` and every rule of the flow is unit tested.
 *
 * The deck keeps one shuffled order for the whole reading. Picking a card moves
 * it into a slot and leaves a gap in the deck; unslotting puts it back in the
 * same spot. Orientation is drawn at shuffle time, like a physical deck, so a
 * card keeps its orientation if it is unslotted and picked again.
 */
import type { Orientation } from '@tarot/content';

export type Rng = () => number;

export type Phase = 'selecting' | 'revealed';

export interface ReadingState {
  /** All card ids in shuffled order. Constant for the whole reading. */
  deck: string[];
  orientation: Record<string, Orientation>;
  /** One entry per spread position; null while empty. */
  slots: Array<string | null>;
  phase: Phase;
}

export type ReadingAction =
  | { type: 'pick'; id: string }
  | { type: 'unslot'; index: number }
  | { type: 'reveal' }
  | { type: 'reset'; state: ReadingState };

/** Chance a card is drawn reversed. */
export const REVERSED_CHANCE = 0.5;

/** Fisher–Yates. Returns a new array. */
export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

export function createReading(cardIds: readonly string[], slotCount: number, rng: Rng = Math.random): ReadingState {
  const deck = shuffle(cardIds, rng);
  const orientation: Record<string, Orientation> = {};
  for (const id of deck) orientation[id] = rng() < REVERSED_CHANCE ? 'reversed' : 'upright';
  return { deck, orientation, slots: Array.from({ length: slotCount }, () => null), phase: 'selecting' };
}

export const isSlotted = (s: ReadingState, id: string) => s.slots.includes(id);
export const filledCount = (s: ReadingState) => s.slots.filter((x) => x !== null).length;
export const canReveal = (s: ReadingState) => s.phase === 'selecting' && s.slots.every((x) => x !== null);

export function readingReducer(state: ReadingState, action: ReadingAction): ReadingState {
  switch (action.type) {
    case 'pick': {
      if (state.phase !== 'selecting') return state;
      if (!state.deck.includes(action.id) || isSlotted(state, action.id)) return state;
      const index = state.slots.indexOf(null);
      if (index === -1) return state;
      const slots = state.slots.slice();
      slots[index] = action.id;
      return { ...state, slots };
    }
    case 'unslot': {
      if (state.phase !== 'selecting' || state.slots[action.index] == null) return state;
      const slots = state.slots.slice();
      slots[action.index] = null;
      return { ...state, slots };
    }
    case 'reveal':
      return canReveal(state) ? { ...state, phase: 'revealed' } : state;
    case 'reset':
      return action.state;
  }
}
