# @tarot/content

The single source of truth for everything both apps say about tarot. **Never duplicate card text in
`apps/mobile` or `apps/web`. Import it from here.**

## Layout

| Path | What | Translated? |
| --- | --- | --- |
| `brand.json` | App name, domain, App Store id, contact. The one place to rename the product. | no |
| `data/cards.json` | 78 card facts: id/slug, arcana, suit, rank, number, deck order, image path, astrology, related cards | no |
| `data/spreads.json` | Spread definitions (currently Past / Present / Future) | no |
| `data/suits.json` | Suit → element | no |
| `data/locales/<locale>/common.json` | Labels: arcana, suits, ranks, spread and position names | yes |
| `data/locales/<locale>/{major,wands,cups,swords,pentacles}.json` | Card text, grouped so each file is reviewable | yes |
| `schema/*.schema.json` | JSON Schemas. Editors such as VS Code use them for autocomplete and inline errors. | |
| `src/` | Types and the read API (`getCards`, `getCard`, `getRelatedCards`, `brand`, …) | |
| `images/` | Card artwork (see `images/README.md`) | |

## Card text fields

Each card in a locale file has:

- `status`: `placeholder` → `draft` (written, awaiting review) → `reviewed` (approved by a human).
- `summary`: a 40–60 word, self-contained answer to "What does <card> mean in tarot?". Websites and
  AI assistants quote this, so answer first and add context after.
- `upright`, `reversed`, `symbolism`: paragraphs.
- `positions.{past,present,future}.{upright,reversed}.short`: one or two sentences for the app's reveal
  screen. The app draws cards at random orientation, so every position needs both.
- `positions.{past,present,future}.{upright,reversed}.long`: a paragraph for the app detail view and the website.
- `keywords.upright` / `keywords.reversed`, and `faq` (3–5 real questions).

## Commands

```sh
pnpm validate                                       # structural errors fail; editorial issues warn
pnpm --filter @tarot/content validate -- --strict   # warnings fail too (use before release)
pnpm --filter @tarot/content placeholders           # add any missing cards; never overwrites
```

## Adding a language

1. Copy `data/locales/en/` to `data/locales/<locale>/` and translate it, setting `status` per card.
2. Register the locale in `src/index.ts` (`locales`) and add it to `brand.json` → `locales`.
3. Run `pnpm validate`.

Card ids are also URL slugs (`/cards/the-tower`), so they stay English and never change.
