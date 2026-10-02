# @tarot/mobile

Expo (SDK 57, React Native, TypeScript, Expo Router) app. iOS first.

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
src/reading/
  reducer.ts          pure reading state machine (shuffle, pick, unslot, reveal, reset)
  reducer.test.ts     unit tests: `pnpm --filter @tarot/mobile test`
  useReading.ts       React hook around the reducer
src/components/       CardBack, CardFace (placeholder art), Deck, SlotRow, ReadingResult, PrimaryButton
src/i18n/             UI strings (en.json) and t()
src/theme.ts          colours, spacing, card aspect ratio
```

Card names and meanings always come from `@tarot/content`. Never hard-code them here.
App name, bundle id and URL scheme come from `packages/content/brand.json` via `app.config.ts`.

## Reading rules

- The deck is shuffled once per reading and each card's orientation (50% reversed) is fixed at shuffle time.
- Tapping a deck card fills the next empty slot (Past → Present → Future); tapping a slotted card returns it.
- Reveal is disabled until every slot is filled. After reveal, slots are locked until New Reading.
