# Card image sources

All 78 card images are the Rider-Waite-Smith tarot deck, illustrated by Pamela Colman Smith
(first published 1909).

| | |
| --- | --- |
| Imported from | npm package `@cometpisces/tarot-kit-images@0.2.0` (`images/*.png`) |
| Imported with | `pnpm --filter @tarot/content import-art -- <folder>` (converted to WebP, no other changes) |
| Package's statement | "The Rider-Waite tarot card images included in this package are believed to be in the public domain in many jurisdictions. However, their copyright status may vary by country and intended use." |

## Copyright notes (read before release)

- **The 1909 drawings are in the public domain** in the US (published before 1929) and in the EU and UK
  (Pamela Colman Smith died in 1951, so the term of life + 70 years ended in 2021).
- **The colouring is the open question.** U.S. Games Systems publishes a 1971 recoloured edition and
  claims copyright in it; copies of that edition carry "© 1971 U.S. Games" in the margin. These
  images show no such notice, but their colouring closely resembles that edition, and the package
  does not say which printing it scanned. **Provenance is not verified.**
- **Not used:** two other image sets that do print "© 1971 U.S. Games" on the cards
  (`tarot-card-img`, the `metabismuth/tarot-json` scans).
- **To remove all doubt** before an App Store release, replace these with scans of an original
  1909–1910 printing from Wikimedia Commons: `pnpm fetch-art --force`. You need network access to
  `commons.wikimedia.org` and `upload.wikimedia.org`. The app needs no other change.
