# Card images

Card artwork lives here, one folder per group, named after `image` in `data/cards.json`:

```
major/16-the-tower.webp
cups/01-ace-of-cups.webp
```

## Getting the art

```sh
pnpm fetch-art          # from the repo root; needs internet access to Wikimedia Commons
git add packages/content/images packages/content/src/images.generated.ts
```

The script downloads the original 1909 Rider-Waite-Smith scans (public domain) from Wikimedia
Commons, resizes them to 600px wide, converts them to WebP, records each source in `SOURCES.md`,
and regenerates `src/images.generated.ts`. The app shows the art automatically; until then it
draws placeholder card faces. `pnpm preview:build` also inlines the art into the web preview.

If a card fails to resolve, the script lists it and exits non-zero. Re-running only fetches the missing
cards (`--force` re-fetches all).

Allowed sources only: the original 1909 Rider-Waite-Smith illustrations (public domain) or original
art supplied by the owner. No modern recoloured or otherwise copyrighted decks.
