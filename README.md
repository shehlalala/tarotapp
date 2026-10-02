# Tarot app + GEO companion site

A free, no-account tarot app for three-card Past / Present / Future readings (iOS first), plus a static
companion website whose job is to make the app discoverable through AI assistants and search.

```
packages/content   card data (JSON), spreads, brand config, shared types: the single source of truth
apps/mobile        Expo (React Native, TypeScript) app
apps/web           Astro static website                            (phase 5)
```

The app name and domain are placeholders (`[APP_NAME]`, `[DOMAIN]`), set in one place:
`packages/content/brand.json`.

## Getting started

Requires Node ≥ 22.18 and pnpm 10.

```sh
pnpm install
pnpm mobile          # run the app: scan the QR code with Expo Go on your phone
pnpm preview:build   # single-file web build of the app: apps/mobile/dist-preview/index.html
pnpm validate        # check card content
pnpm typecheck
pnpm test
```

## Card art

All 78 cards use the Rider-Waite-Smith deck, illustrated by Pamela Colman Smith (1909). The images
were imported from the npm package `@cometpisces/tarot-kit-images` with
`pnpm --filter @tarot/content import-art`. **Read `packages/content/images/SOURCES.md` before
release:** it isn't confirmed which printing these were scanned from.

To swap in verified scans of an original 1909–1910 printing from Wikimedia Commons, run
`pnpm fetch-art --force`. It needs network access to Commons.

The project's own Major Arcana illustrations are kept as source in
`packages/content/scripts/art/` and are not used in the app.

## Principles

- No accounts, no backend, no analytics, no tracking. All app data stays on the device.
- All card text lives in `packages/content`. Neither app hard-codes card names or meanings.
- Card art: the Rider-Waite-Smith deck (see the provenance notes in `packages/content/images/SOURCES.md`).

## Status

**MVP (done):**
- Reading flow: shuffle, pick three cards, staggered 3D flip on reveal, random reversals.
- Card detail view, reading history kept on the device, About screen, and text sharing.
- Rider-Waite-Smith images on all 78 cards, and a web preview build.
- Drafted text for all 78 cards (status `draft`, awaiting your review): summary, keywords,
  upright and reversed meanings, and Past/Present/Future meanings for both orientations.

**Next:**
- Website (Astro): homepage, 78 card pages, guides, robots.txt, sitemap, llms.txt, structured
  data, and a privacy policy.
- Web-only content: long position meanings, symbolism and FAQ (`pnpm validate --strict` lists
  what is missing).
- A designed share image (the MVP shares text).
- An i18n library swap. Strings are already in `apps/mobile/src/i18n/en.json`.
- EAS Build configuration and the App Store pre-submission checklist.
