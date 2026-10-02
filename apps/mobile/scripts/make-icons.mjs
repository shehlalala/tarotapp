/**
 * Generates the app icon and splash image from one original emblem (the same
 * star-in-ring motif as the card back), so they stay consistent.
 *
 *   node apps/mobile/scripts/make-icons.mjs
 *
 * Outputs (apps/mobile/assets):
 *   icon.png         1024×1024, opaque (App Store Connect rejects transparency)
 *   splash-icon.png  1024×1024, transparent, centred on the splash background colour
 */
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets');
mkdirSync(out, { recursive: true });

const GOLD = '#D8B76A';
const GOLD_LIGHT = '#F3E2AE';

function star(cx, cy, R, r, n) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const rr = i % 2 === 0 ? R : r;
    const a = ((-90 + (i * 180) / n) * Math.PI) / 180;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(' ');
}

/** The emblem: three cards fanned behind a ring and an eight-pointed star. */
const emblem = (s = 1) => `
  <g transform="translate(512 540) scale(${s}) translate(-512 -540)">
    ${[-16, 0, 16].map((deg) => `
      <g transform="rotate(${deg} 512 900)">
        <rect x="372" y="300" width="280" height="480" rx="26" fill="#231B45" stroke="${GOLD}" stroke-width="8"/>
        <rect x="396" y="324" width="232" height="432" rx="16" fill="none" stroke="#8C7744" stroke-width="4"/>
      </g>`).join('')}
    <circle cx="512" cy="540" r="132" fill="#1B1530" stroke="${GOLD}" stroke-width="10"/>
    <polygon points="${star(512, 540, 104, 38, 8)}" fill="${GOLD_LIGHT}" stroke="${GOLD}" stroke-width="4" stroke-linejoin="round"/>
  </g>`;

const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">
  <defs>
    <radialGradient id="bg" cx="0.5" cy="0.45" r="0.75">
      <stop offset="0" stop-color="#3A2E66"/><stop offset="1" stop-color="#0E0B16"/>
    </radialGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#bg)"/>
  ${emblem(1)}
</svg>`;

const splash = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">${emblem(0.9)}</svg>`;

await sharp(Buffer.from(icon)).flatten({ background: '#0E0B16' }).png().toFile(join(out, 'icon.png'));
await sharp(Buffer.from(splash)).png().toFile(join(out, 'splash-icon.png'));
console.log('Wrote assets/icon.png and assets/splash-icon.png');
