import { Platform } from 'react-native';

/** Design tokens. Calm dark base, warm gold accent. */
export const colors = {
  bg: '#0E0B16',
  surface: '#17122A',
  surfaceRaised: '#211A3A',
  border: '#3A2F5C',
  gold: '#D8B76A',
  goldLight: '#F3E2AE',
  goldMuted: '#8C7744',
  text: '#F1EADB',
  textMuted: '#A79EB8',
  textFaint: '#6E6585',
  cardBack: '#231B45',
  cardFace: '#1B1530',
} as const;

export const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;

export const radius = { card: 8, button: 999 } as const;

/** Rider-Waite-Smith cards are about 2.75 × 4.75 in. */
export const CARD_ASPECT = 2.75 / 4.75;

export const fonts = {
  serif: Platform.select({ ios: 'Georgia', default: 'serif' }),
} as const;
