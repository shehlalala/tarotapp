/**
 * Downloads the public-domain 1909 Rider-Waite-Smith card scans from Wikimedia
 * Commons, converts them to WebP, and regenerates src/images.generated.ts so
 * the app picks them up automatically.
 *
 *   pnpm fetch-art            # skips cards that already have an image
 *   pnpm fetch-art --force    # re-downloads everything
 *
 * Needs internet access to commons.wikimedia.org and upload.wikimedia.org.
 * Run it once on your own machine and commit packages/content/images.
 */
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import type { CardFactsFile, CardFacts } from '../src/types.ts';
import { writeImageMap } from './lib/imageMap.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const imagesDir = join(root, 'images');
const force = process.argv.includes('--force');

const WIDTH = 600;
const API = 'https://commons.wikimedia.org/w/api.php';
// Wikimedia asks automated clients to identify themselves.
const HEADERS = { 'User-Agent': 'tarot-app-content-fetch/1.0 (one-off download of public-domain card scans)' };

/** Commons file names, newest naming first. Majors as "RWS Tarot NN Name.jpg". */
const MAJOR_NAMES = [
  'Fool', 'Magician', 'High Priestess', 'Empress', 'Emperor', 'Hierophant', 'Lovers', 'Chariot',
  'Strength', 'Hermit', 'Wheel of Fortune', 'Justice', 'Hanged Man', 'Death', 'Temperance', 'Devil',
  'Tower', 'Star', 'Moon', 'Sun', 'Judgement', 'World',
];
const SUIT_PREFIX: Record<string, string> = { wands: 'Wands', cups: 'Cups', swords: 'Swords', pentacles: 'Pents' };

const pad = (n: number) => String(n).padStart(2, '0');

function candidates(card: CardFacts): { titles: string[]; search: string } {
  if (card.arcana === 'major') {
    const nn = pad(card.number);
    const name = MAJOR_NAMES[card.number]!;
    const titles = [`RWS Tarot ${nn} ${name}.jpg`];
    if (name === 'Lovers') titles.push('TheLovers.jpg');
    return { titles, search: `intitle:"RWS Tarot ${nn}"` };
  }
  const file = `${SUIT_PREFIX[card.suit!]}${pad(card.number)}`;
  return { titles: [`${file}.jpg`], search: `intitle:"${file}"` };
}

interface ImageInfo {
  title: string;
  url: string;
  pageUrl: string;
  license: string;
}

async function api(params: Record<string, string>): Promise<any> {
  const url = `${API}?${new URLSearchParams({ format: 'json', formatversion: '2', origin: '*', ...params })}`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`Commons API ${res.status} for ${url}`);
  return res.json();
}

async function imageInfo(titles: string[]): Promise<ImageInfo | null> {
  const data = await api({
    action: 'query',
    titles: titles.map((t) => `File:${t}`).join('|'),
    prop: 'imageinfo',
    iiprop: 'url|extmetadata',
    iiurlwidth: String(WIDTH * 2),
  });
  for (const page of data.query?.pages ?? []) {
    const info = page.imageinfo?.[0];
    if (!page.missing && info) {
      return {
        title: page.title,
        url: info.thumburl ?? info.url,
        pageUrl: info.descriptionurl,
        license: info.extmetadata?.LicenseShortName?.value ?? 'unknown',
      };
    }
  }
  return null;
}

async function resolve(card: CardFacts): Promise<ImageInfo | null> {
  const { titles, search } = candidates(card);
  const direct = await imageInfo(titles);
  if (direct) return direct;
  const found = await api({ action: 'query', list: 'search', srnamespace: '6', srlimit: '1', srsearch: search });
  const title: string | undefined = found.query?.search?.[0]?.title;
  return title ? imageInfo([title.replace(/^File:/, '')]) : null;
}

const { cards } = JSON.parse(readFileSync(join(root, 'data/cards.json'), 'utf8')) as CardFactsFile;
const sources: string[] = [];
const failed: string[] = [];

for (const card of cards) {
  const out = join(imagesDir, `${card.image}.webp`);
  if (existsSync(out) && !force) {
    sources.push(`| ${card.id} | (kept existing file) | | |`);
    continue;
  }
  try {
    const info = await resolve(card);
    if (!info) throw new Error('no matching file on Commons');
    const res = await fetch(info.url, { headers: HEADERS });
    if (!res.ok) throw new Error(`download ${res.status}`);
    const input = Buffer.from(await res.arrayBuffer());
    mkdirSync(dirname(out), { recursive: true });
    await sharp(input).resize({ width: WIDTH }).webp({ quality: 82 }).toFile(out);
    // The scan replaces any original artwork for this card (its SVG source stays in scripts/art).
    rmSync(join(imagesDir, `${card.image}.svg`), { force: true });
    sources.push(`| ${card.id} | ${info.title} | ${info.pageUrl} | ${info.license} |`);
    console.log(`✓ ${card.id} ← ${info.title}`);
  } catch (e) {
    failed.push(card.id);
    console.error(`✗ ${card.id}: ${(e as Error).message}`);
  }
}

writeFileSync(
  join(imagesDir, 'SOURCES.md'),
  [
    '# Card image sources',
    '',
    'Original 1909 Rider-Waite-Smith illustrations by Pamela Colman Smith, public domain.',
    'Downloaded from Wikimedia Commons by `scripts/fetch-art.ts`.',
    '',
    '| Card | Commons file | Source | License |',
    '| --- | --- | --- | --- |',
    ...sources,
    '',
  ].join('\n'),
);

const present = writeImageMap(root);

console.log(`\n${present}/78 cards have art.${failed.length ? ` Failed: ${failed.join(', ')}` : ''}`);
if (failed.length) process.exitCode = 1;
