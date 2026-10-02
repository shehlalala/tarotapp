/**
 * Renders the original Major Arcana artwork (scripts/art/archetypes.ts) to
 * images/major/*.webp and regenerates src/images.generated.ts.
 *
 *   pnpm --filter @tarot/content render-art            # render all 22
 *   pnpm --filter @tarot/content render-art -- --sheet <out.png>   # also write a contact sheet
 *
 * Cards that already have a downloaded scan (from fetch-art) are skipped unless
 * --force is passed.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import type { CardFactsFile } from '../src/types.ts';
import { ARCHETYPES, cardSvg } from './art/archetypes.ts';
import { writeImageMap } from './lib/imageMap.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { cards } = JSON.parse(readFileSync(join(root, 'data/cards.json'), 'utf8')) as CardFactsFile;
const majors = cards.filter((c) => c.arcana === 'major');

const missing = majors.filter((c) => !ARCHETYPES[c.id]).map((c) => c.id);
if (missing.length) throw new Error(`no artwork for: ${missing.join(', ')}`);

const force = process.argv.includes('--force');
const rendered: Buffer[] = [];
for (const card of majors) {
  const svg = cardSvg(card.id);
  const out = join(root, 'images', `${card.image}.webp`);
  const isScan = existsSync(out) && !existsSync(join(root, 'images', `${card.image}.svg`));
  if (isScan && !force) {
    console.log(`skip ${card.id}: has a downloaded scan (use --force to replace it with original art)`);
    continue;
  }
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(join(root, 'images', `${card.image}.svg`), svg);
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  await sharp(png).webp({ quality: 86 }).toFile(out);
  rendered.push(png);
}

const sheetArg = process.argv.indexOf('--sheet');
if (sheetArg > -1 && process.argv[sheetArg + 1]) {
  const tileW = 200;
  const tileH = Math.round((tileW * 1036) / 600);
  const cols = 6;
  const rows = Math.ceil(rendered.length / cols);
  const tiles = await Promise.all(rendered.map((b) => sharp(b).resize(tileW, tileH).png().toBuffer()));
  await sharp({ create: { width: cols * (tileW + 8) + 8, height: rows * (tileH + 8) + 8, channels: 3, background: '#000' } })
    .composite(tiles.map((input, i) => ({ input, left: 8 + (i % cols) * (tileW + 8), top: 8 + Math.floor(i / cols) * (tileH + 8) })))
    .png()
    .toFile(process.argv[sheetArg + 1]!);
}

console.log(`Rendered ${rendered.length} Major Arcana cards. ${writeImageMap(root)}/78 cards have art.`);
