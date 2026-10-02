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
pnpm validate     # check card content
pnpm typecheck
```

## Principles

- No accounts, no backend, no analytics, no tracking. All app data stays on the device.
- All card text lives in `packages/content`. Neither app hard-codes card names or meanings.
- Card art is limited to the 1909 Rider-Waite-Smith illustrations (public domain) or original art.

## Build phases

1. ✅ Monorepo, shared content package, types, card schema, placeholder data for all 78 cards
2. ✅ Mobile: card selection flow, slots, Reveal button logic
3. ✅ Mobile: shuffle and flip animations, detail view, New Reading
4. ⬜ Mobile: reading history, share image, About screen, i18n
5. ⬜ Web: Astro setup, layout, homepage, robots.txt, sitemap, llms.txt, structured data
6. ⬜ Web: 78 card pages and guides
7. ⬜ Content: draft all card meanings for review
8. ⬜ EAS Build configuration and App Store pre-submission checklist
