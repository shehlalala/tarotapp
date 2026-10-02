/**
 * Imports a folder of Rider-Waite-Smith card images named like the
 * @cometpisces/tarot-kit-images package ("00-TheFool.png", "Cups01.png",
 * "Pentacles14.png" …), converts them to WebP in images/, and regenerates the
 * image map. Imported cards replace any original artwork for the same card.
 *
 *   npm pack @cometpisces/tarot-kit-images@0.2.0 && tar xzf cometpisces-tarot-kit-images-0.2.0.tgz
 *   pnpm --filter @tarot/content import-art -- <path>/package/images
 */
import { existsSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import type { CardFactsFile } from '../src/types.ts';
import { writeImageMap } from './lib/imageMap.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const from = process.argv[2];
if (!from || !existsSync(from)) {
  console.error('usage: import-art <folder of card images>');
  process.exit(1);
}

const SUIT_PREFIX: Record<string, string> = { wands: 'Wands', cups: 'Cups', swords: 'Swords', pentacles: 'Pentacles' };
const pad = (n: number) => String(n).padStart(2, '0');
const files = readdirSync(from);
const { cards } = JSON.parse(readFileSync(join(root, 'data/cards.json'), 'utf8')) as CardFactsFile;

const missing: string[] = [];
for (const card of cards) {
  const prefix = card.arcana === 'major' ? `${pad(card.number)}-` : `${SUIT_PREFIX[card.suit!]}${pad(card.number)}.`;
  const file = files.find((f) => f.startsWith(prefix) && /\.(png|jpe?g|webp)$/i.test(f));
  if (!file) {
    missing.push(card.id);
    continue;
  }
  // Keep the source resolution (no upscaling); WebP at high quality.
  await sharp(join(from, file)).webp({ quality: 90 }).toFile(join(root, 'images', `${card.image}.webp`));
  // An imported card replaces original artwork, so drop its SVG (source stays in scripts/art).
  rmSync(join(root, 'images', `${card.image}.svg`), { force: true });
}

const count = writeImageMap(root);
console.log(`Imported ${cards.length - missing.length} cards. ${count}/78 cards have art.`);
if (missing.length) {
  console.error(`No image found for: ${missing.join(', ')}`);
  process.exitCode = 1;
}
