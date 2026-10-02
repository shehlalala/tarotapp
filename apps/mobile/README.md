# @tarot/mobile

Expo (SDK 57, React Native, TypeScript, Expo Router, Reanimated 4) app. iOS first.

## Run it

```sh
pnpm install              # from the repo root
pnpm mobile               # = expo start; scan the QR code with Expo Go on your phone
```

## Layout

```
app/                  Expo Router screens
  _layout.tsx         root stack, dark theme
  index.tsx           the reading screen (opens straight into a reading)
  card/[id].tsx       card detail modal (long position meaning, general meaning, keywords, symbolism)
src/reading/
  reducer.ts          pure reading state machine (shuffle, pick, unslot, reveal, reset)
  reducer.test.ts     unit tests (all tests: `pnpm --filter @tarot/mobile test`)
  useReading.ts       React hook around the reducer
src/animation/
  motion.ts           all animation timings + flight geometry (unit tested)
src/components/       CardBack, CardFace (placeholder art), Deck, SlotRow, ReadingResult, PrimaryButton,
                      ShuffleAnimation, FlipCard, FlyingCard
src/i18n/             UI strings (en.json) and t()
src/theme.ts          colours, spacing, card aspect ratio
```

Card names and meanings always come from `@tarot/content`. Never hard-code them here.
App name, bundle id and URL scheme come from `packages/content/brand.json` via `app.config.ts`.

## Reading rules

- The deck is shuffled once per reading and each card's orientation (50% reversed) is fixed at shuffle time.
- Tapping a deck card fills the next empty slot (Past → Present → Future); tapping a slotted card returns it.
- Reveal is disabled until every slot is filled. After reveal, slots are locked until New Reading.

## Motion

All timings live in `src/animation/motion.ts`.

- **Shuffle** (~1.3s) on launch and New Reading: a small stack riffles twice, then the deck fades in.
- **Pick**: the tapped card flies along a slight arc into the next empty slot (380ms).
- **Reveal**: cards flip one at a time with a 3D rotation (600ms each, 650ms apart); each card's
  orientation label and meaning fade in as its flip finishes.
- **Reduce Motion** (iOS accessibility setting) is respected: no shuffle or flight, and flips become
  a short crossfade.
