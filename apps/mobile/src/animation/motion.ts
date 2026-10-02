/**
 * Motion timings, in one place so the choreography stays consistent.
 * Pure constants and maths: no React Native imports, so it is unit tested.
 */

/** One card's 3D flip on reveal. */
export const FLIP_MS = 600;
/** Gap between flip starts. Equal to FLIP_MS plus a beat, so cards flip one at a time. */
export const FLIP_STAGGER_MS = 650;
/** A card flying from the deck to its slot. */
export const FLIGHT_MS = 380;
/** Shuffle on launch and on New Reading. */
export const SHUFFLE_CARDS = 7;
export const SHUFFLE_RIFFLE_MS = 260;
export const SHUFFLE_RIFFLES = 2;
export const SHUFFLE_CARD_STAGGER_MS = 45;
export const SHUFFLE_MS =
  SHUFFLE_CARD_STAGGER_MS * (SHUFFLE_CARDS - 1) + SHUFFLE_RIFFLE_MS * 2 * SHUFFLE_RIFFLES + 150;
/** Short crossfade used instead of motion when the user has Reduce Motion on. */
export const REDUCED_MOTION_MS = 200;

/** When the card in slot `index` starts flipping, relative to Reveal. */
export const flipDelay = (index: number) => index * FLIP_STAGGER_MS;

/** When the card in slot `index` has finished flipping. */
export const flipEnd = (index: number) => flipDelay(index) + FLIP_MS;

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Transform that moves a box drawn at `from` so it covers `to`.
 * React Native scales around the centre, so we align centres and scale by width.
 */
export function flightTransform(from: Rect, to: Rect) {
  return {
    dx: to.x + to.width / 2 - (from.x + from.width / 2),
    dy: to.y + to.height / 2 - (from.y + from.height / 2),
    scale: from.width > 0 ? to.width / from.width : 1,
  };
}
