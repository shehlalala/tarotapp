/**
 * Original Major Arcana artwork, drawn for this project.
 *
 * Each card is an emblem built from its archetype's traditional symbols (the
 * Tower and lightning, the Star over the pool, Justice's sword and scales), in
 * gold line work on the app's night palette. The symbols are centuries-old
 * tarot tradition; these drawings are new and owned by the project.
 *
 * Canvas: 600 × 1036 (the Rider-Waite-Smith proportions). The top band
 * (y < 130) and bottom band (y > 906) are left plain: the app draws the
 * numeral and the localized card name there.
 */

export const W = 600;
export const H = 1036;

const C = {
  gold: '#D8B76A',
  goldLight: '#F3E2AE',
  goldDeep: '#9C7F3E',
  ink: '#0E0B16',
  night: '#1B1530',
  violet: '#3A2F5C',
  violetLight: '#6B4E9B',
  ivory: '#EDE4D0',
  red: '#A9483A',
  blue: '#4F6FA8',
  blueLight: '#7D9BCB',
  green: '#5B7F52',
  greenDark: '#3D5A3A',
  stone: '#5A5470',
  stoneDark: '#3B3650',
  earth: '#6A4A35',
};

// ---------------------------------------------------------------------------
// Drawing helpers. Everything returns SVG markup strings.
// ---------------------------------------------------------------------------
const f = (n: number) => Number(n.toFixed(1));
const rad = (deg: number) => (deg * Math.PI) / 180;

type Attrs = Record<string, string | number | undefined>;
const attrs = (a: Attrs) =>
  Object.entries(a)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}="${v}"`)
    .join(' ');

const line = (x1: number, y1: number, x2: number, y2: number, a: Attrs = {}) =>
  `<line ${attrs({ x1, y1, x2, y2, stroke: C.gold, strokeWidth: 4, strokeLinecap: 'round', ...a })}/>`;
const circle = (cx: number, cy: number, r: number, a: Attrs = {}) =>
  `<circle ${attrs({ cx, cy, r, fill: 'none', stroke: C.gold, strokeWidth: 4, ...a })}/>`;
const ellipse = (cx: number, cy: number, rx: number, ry: number, a: Attrs = {}) =>
  `<ellipse ${attrs({ cx, cy, rx, ry, fill: 'none', stroke: C.gold, strokeWidth: 4, ...a })}/>`;
const rect = (x: number, y: number, w: number, h: number, a: Attrs = {}) =>
  `<rect ${attrs({ x, y, width: w, height: h, fill: 'none', stroke: C.gold, strokeWidth: 4, ...a })}/>`;
const path = (d: string, a: Attrs = {}) =>
  `<path ${attrs({ d, fill: 'none', stroke: C.gold, strokeWidth: 4, strokeLinejoin: 'round', strokeLinecap: 'round', ...a })}/>`;
const group = (transform: string, ...children: string[]) => `<g transform="${transform}">${children.join('')}</g>`;

/** Star polygon with n points. */
function star(cx: number, cy: number, R: number, r: number, n: number, a: Attrs = {}, rot = -90) {
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const rr = i % 2 === 0 ? R : r;
    const ang = rad(rot + (i * 180) / n);
    pts.push(`${f(cx + rr * Math.cos(ang))},${f(cy + rr * Math.sin(ang))}`);
  }
  return `<polygon ${attrs({ points: pts.join(' '), fill: C.goldLight, stroke: C.gold, strokeWidth: 2, strokeLinejoin: 'round', ...a })}/>`;
}

/** Radiating rays; `wavy` alternates straight and wavy rays like the Sun card. */
function rays(cx: number, cy: number, r1: number, r2: number, n: number, a: Attrs = {}, wavy = false, offset = 0) {
  let out = '';
  for (let i = 0; i < n; i++) {
    const ang = rad(offset + (i * 360) / n);
    const x1 = cx + r1 * Math.cos(ang);
    const y1 = cy + r1 * Math.sin(ang);
    const x2 = cx + r2 * Math.cos(ang);
    const y2 = cy + r2 * Math.sin(ang);
    if (wavy && i % 2 === 1) {
      const nx = -Math.sin(ang) * 10;
      const ny = Math.cos(ang) * 10;
      const p = (t: number) => [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t];
      const [ax, ay] = p(0.33);
      const [bx, by] = p(0.66);
      out += path(`M${f(x1)} ${f(y1)} Q${f(ax! + nx)} ${f(ay! + ny)} ${f((x1 + x2) / 2)} ${f((y1 + y2) / 2)} T${f(x2)} ${f(y2)}`, { strokeWidth: 3, ...a });
      void bx; void by;
    } else {
      out += line(x1, y1, x2, y2, { strokeWidth: 3, ...a });
    }
  }
  return out;
}

const cloud = (x: number, y: number, s: number, fill: string = C.violet) =>
  [
    [0, 0, 1],
    [-0.9, 0.25, 0.75],
    [0.9, 0.25, 0.75],
    [-0.45, -0.35, 0.7],
    [0.45, -0.3, 0.72],
  ]
    .map(([dx, dy, r]) => circle(x + dx! * 40 * s, y + dy! * 40 * s, r! * 40 * s, { fill, stroke: 'none' }))
    .join('');

/** Five-petal rose. */
function rose(x: number, y: number, s: number, fill: string = C.red, center: string = C.gold) {
  let out = '';
  for (let i = 0; i < 5; i++) {
    const a = rad(-90 + i * 72);
    out += circle(x + Math.cos(a) * 11 * s, y + Math.sin(a) * 11 * s, 10 * s, { fill, stroke: C.goldDeep, strokeWidth: 1.5 });
  }
  return out + circle(x, y, 6 * s, { fill: center, stroke: 'none' });
}

/** Lily: three ivory petals on a stem. */
function lily(x: number, y: number, s: number) {
  return (
    line(x, y, x, y + 60 * s, { stroke: C.green, strokeWidth: 3 }) +
    path(`M${x} ${y} q${-22 * s} ${-10 * s} ${-26 * s} ${-34 * s} q${16 * s} ${4 * s} ${26 * s} ${18 * s} q${10 * s} ${-14 * s} ${26 * s} ${-18 * s} q${-4 * s} ${24 * s} ${-26 * s} ${34 * s}z`, { fill: C.ivory, stroke: C.goldDeep, strokeWidth: 1.5 }) +
    path(`M${x} ${y} l0 ${-40 * s}`, { stroke: C.ivory, strokeWidth: 6 })
  );
}

const cup = (x: number, y: number, s: number, fill: string = C.gold) =>
  path(`M${x - 22 * s} ${y - 40 * s} h${44 * s} q${-2 * s} ${34 * s} ${-18 * s} ${40 * s} v${18 * s} h${12 * s} v${8 * s} h${-32 * s} v${-8 * s} h${12 * s} v${-18 * s} q${-16 * s} ${-6 * s} ${-18 * s} ${-40 * s}z`, { fill, stroke: C.goldDeep, strokeWidth: 2 });

function sword(x: number, yTip: number, len: number, w = 14, a: Attrs = {}) {
  const yGuard = yTip + len * 0.72;
  return (
    path(`M${x} ${yTip} L${x + w / 2} ${yTip + 24} L${x + w / 2} ${yGuard} L${x - w / 2} ${yGuard} L${x - w / 2} ${yTip + 24}Z`, { fill: C.ivory, stroke: C.goldDeep, strokeWidth: 2, ...a }) +
    line(x, yTip + 20, x, yGuard - 6, { stroke: C.stone, strokeWidth: 1.5 }) +
    rect(x - w * 2.4, yGuard, w * 4.8, 10, { fill: C.gold, stroke: C.goldDeep, strokeWidth: 2, rx: 4 }) +
    rect(x - 5, yGuard + 10, 10, len * 0.22, { fill: C.earth, stroke: C.goldDeep, strokeWidth: 2 }) +
    circle(x, yGuard + 14 + len * 0.22, 9, { fill: C.gold, stroke: C.goldDeep, strokeWidth: 2 })
  );
}

const pentacle = (x: number, y: number, r: number) =>
  circle(x, y, r, { fill: C.gold, stroke: C.goldDeep, strokeWidth: 2 }) +
  star(x, y, r * 0.75, r * 0.3, 5, { fill: 'none', stroke: C.ink, strokeWidth: 2 });

const wand = (x1: number, y1: number, x2: number, y2: number) =>
  line(x1, y1, x2, y2, { stroke: C.earth, strokeWidth: 9 }) +
  circle(x2, y2, 6, { fill: C.green, stroke: 'none' }) +
  circle(x1, y1, 5, { fill: C.green, stroke: 'none' });

function pillar(x: number, top: number, bottom: number, w: number, fill: string) {
  return (
    rect(x, top + 30, w, bottom - top - 60, { fill, stroke: C.gold, strokeWidth: 3 }) +
    rect(x - 10, top, w + 20, 30, { fill, stroke: C.gold, strokeWidth: 3, rx: 4 }) +
    rect(x - 10, bottom - 30, w + 20, 30, { fill, stroke: C.gold, strokeWidth: 3, rx: 4 })
  );
}

const infinity = (x: number, y: number, s: number, a: Attrs = {}) =>
  path(`M${x} ${y} C${x - 10 * s} ${y - 30 * s} ${x - 50 * s} ${y - 30 * s} ${x - 50 * s} ${y} C${x - 50 * s} ${y + 30 * s} ${x - 10 * s} ${y + 30 * s} ${x} ${y} C${x + 10 * s} ${y - 30 * s} ${x + 50 * s} ${y - 30 * s} ${x + 50 * s} ${y} C${x + 50 * s} ${y + 30 * s} ${x + 10 * s} ${y + 30 * s} ${x} ${y}Z`, { strokeWidth: 5, ...a });

/** Crescent opening to the right, centred on (x, y). */
const crescent = (x: number, y: number, r: number, fill: string = C.goldLight) =>
  path(`M${x} ${y - r} A${r} ${r} 0 1 0 ${x} ${y + r} A${r * 1.3} ${r * 1.3} 0 0 1 ${x} ${y - r}Z`, { fill, stroke: C.gold, strokeWidth: 2 });

const drop = (x: number, y: number, s: number, fill: string = C.goldLight) =>
  path(`M${x} ${y - 14 * s} Q${x + 9 * s} ${y} ${x} ${y + 6 * s} Q${x - 9 * s} ${y} ${x} ${y - 14 * s}Z`, { fill, stroke: 'none' });

const flame = (x: number, y: number, s: number, fill: string = C.red) =>
  path(`M${x} ${y - 34 * s} C${x + 18 * s} ${y - 10 * s} ${x + 16 * s} ${y + 10 * s} ${x} ${y + 12 * s} C${x - 16 * s} ${y + 10 * s} ${x - 18 * s} ${y - 10 * s} ${x} ${y - 34 * s}Z`, { fill, stroke: C.gold, strokeWidth: 2 });

const mountains = (pts: string, fill: string, top = true) =>
  path(`M60 ${pts} V906 H60Z`.replace('M60 ', 'M'), { fill, stroke: top ? C.goldDeep : 'none', strokeWidth: 2 });

const ground = (y: number, fill: string = C.violet) => path(`M42 ${y} Q300 ${y - 24} 558 ${y} V906 H42Z`, { fill, stroke: C.goldDeep, strokeWidth: 2 });

const water = (y0: number, rows: number, fill: string = C.blue) =>
  rect(42, y0, 516, 906 - y0, { fill, stroke: 'none' }) +
  Array.from({ length: rows }, (_, i) => path(`M60 ${y0 + 18 + i * 22} q30 -8 60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0`, { stroke: C.blueLight, strokeWidth: 2 })).join('');

// ---------------------------------------------------------------------------
// The 22 cards. Keys are card ids from data/cards.json.
// ---------------------------------------------------------------------------
export const ARCHETYPES: Record<string, string> = {
  'the-fool':
    rays(430, 270, 70, 112, 16) +
    circle(430, 270, 58, { fill: C.goldLight }) +
    mountains('60 700 L150 600 L230 660 L330 560 L440 670 L540 610', C.violet) +
    path('M42 906 V720 Q110 690 200 700 L290 730 L318 770 L296 800 L330 906Z', { fill: C.earth, stroke: C.gold, strokeWidth: 3 }) +
    line(190, 600, 340, 430, { stroke: C.earth, strokeWidth: 8 }) +
    circle(352, 418, 26, { fill: C.red, stroke: C.gold, strokeWidth: 3 }) +
    line(338, 404, 366, 432, { stroke: C.gold, strokeWidth: 2 }) +
    rose(200, 470, 1.2, C.ivory) +
    line(200, 486, 206, 540, { stroke: C.green, strokeWidth: 3 }) +
    ellipse(240, 688, 28, 14, { fill: C.ivory, stroke: C.goldDeep, strokeWidth: 2 }) +
    circle(268, 670, 12, { fill: C.ivory, stroke: C.goldDeep, strokeWidth: 2 }) +
    line(218, 700, 222, 716, { stroke: C.ivory, strokeWidth: 4 }) +
    line(258, 700, 262, 716, { stroke: C.ivory, strokeWidth: 4 }) +
    path('M212 684 q-16 -18 -6 -30', { stroke: C.ivory, strokeWidth: 4 }) +
    star(150, 230, 10, 4, 4) + star(500, 420, 8, 3, 4),

  'the-magician':
    infinity(300, 220, 1) +
    rays(300, 300, 26, 60, 12, { stroke: C.goldLight }) +
    line(300, 300, 300, 560, { stroke: C.ivory, strokeWidth: 10 }) +
    circle(300, 300, 10, { fill: C.goldLight, stroke: 'none' }) +
    circle(300, 560, 10, { fill: C.goldLight, stroke: 'none' }) +
    path('M300 600 L280 630 L320 630Z', { fill: C.gold, stroke: 'none' }) +
    rect(100, 660, 400, 34, { fill: C.violet, stroke: C.gold, strokeWidth: 3, rx: 4 }) +
    line(130, 694, 130, 800, { stroke: C.gold, strokeWidth: 6 }) +
    line(470, 694, 470, 800, { stroke: C.gold, strokeWidth: 6 }) +
    cup(165, 656, 0.9) +
    sword(240, 560, 96, 10) +
    pentacle(355, 630, 26) +
    wand(405, 652, 470, 618) +
    [130, 210, 300, 390, 470].map((x) => rose(x, 850, 1)).join('') +
    [170, 260, 345, 430].map((x) => lily(x, 780, 0.8)).join(''),

  'the-high-priestess':
    rect(150, 260, 300, 560, { fill: C.violetLight, stroke: 'none', opacity: 0.45 }) +
    [0, 1, 2, 3].flatMap((row) => [0, 1, 2].map((col) => circle(205 + col * 95 + (row % 2) * 45, 330 + row * 120, 18, { fill: C.red, stroke: C.goldDeep, strokeWidth: 2 }))).join('') +
    pillar(80, 230, 880, 60, C.ink) +
    pillar(460, 230, 880, 60, C.ivory) +
    circle(110, 300, 10, { fill: C.ivory, stroke: 'none' }) +
    circle(490, 300, 10, { fill: C.ink, stroke: 'none' }) +
    circle(300, 300, 26, { fill: C.ivory, stroke: C.gold, strokeWidth: 3 }) +
    crescent(258, 300, 22) +
    group('translate(342 300) scale(-1 1) translate(-342 -300)', crescent(342, 300, 22)) +
    line(270, 470, 330, 470, { stroke: C.ivory, strokeWidth: 8 }) +
    line(300, 440, 300, 500, { stroke: C.ivory, strokeWidth: 8 }) +
    rect(240, 560, 120, 70, { fill: C.ivory, stroke: C.gold, strokeWidth: 3, rx: 10 }) +
    [580, 596, 612].map((y) => line(258, y, 342, y, { stroke: C.stone, strokeWidth: 2 })).join('') +
    group('rotate(-90 300 790)', crescent(300, 790, 48)) +
    water(846, 2),

  'the-empress':
    group('translate(0 0)', ...Array.from({ length: 12 }, (_, i) => {
      const a = rad(200 + (i * 140) / 11);
      return star(300 + 150 * Math.cos(a), 370 + 150 * Math.sin(a), 13, 5, 6);
    })) +
    ellipse(110, 470, 34, 170, { fill: C.greenDark, stroke: C.goldDeep, strokeWidth: 2 }) +
    ellipse(490, 470, 34, 170, { fill: C.greenDark, stroke: C.goldDeep, strokeWidth: 2 }) +
    [480, 500, 520].map((x) => path(`M${x} 250 q8 60 0 120 q-8 60 0 120`, { stroke: C.blueLight, strokeWidth: 3 })).join('') +
    path('M300 470 C300 420 220 410 220 480 C220 540 290 580 300 620 C310 580 380 540 380 480 C380 410 300 420 300 470Z', { fill: C.violet, stroke: C.gold, strokeWidth: 4 }) +
    circle(300, 495, 26, { stroke: C.goldLight, strokeWidth: 5 }) +
    line(300, 521, 300, 565, { stroke: C.goldLight, strokeWidth: 5 }) +
    line(282, 545, 318, 545, { stroke: C.goldLight, strokeWidth: 5 }) +
    ground(760, C.greenDark) +
    Array.from({ length: 9 }, (_, i) => {
      const x = 80 + i * 55;
      return (
        line(x, 900, x + 6, 700, { stroke: C.goldDeep, strokeWidth: 3 }) +
        [0, 1, 2, 3].map((k) => ellipse(x + 6 + (k % 2 ? 7 : -7), 712 + k * 16, 5, 11, { fill: C.gold, stroke: 'none' })).join('')
      );
    }).join(''),

  'the-emperor':
    mountains('60 650 L130 520 L200 600 L280 460 L360 590 L440 490 L540 630', C.earth) +
    rect(160, 420, 280, 440, { fill: C.stone, stroke: C.gold, strokeWidth: 4, rx: 6 }) +
    rect(190, 470, 220, 360, { fill: C.stoneDark, stroke: C.goldDeep, strokeWidth: 2 }) +
    [175, 425].map((x) => path(`M${x} 440 a20 20 0 1 1 0.1 0 m0 0 a10 10 0 1 0 0.1 0`, { stroke: C.goldLight, strokeWidth: 4 })).join('') +
    circle(300, 520, 34, { fill: C.stone, stroke: C.gold, strokeWidth: 3 }) +
    path('M268 508 c-30 -20 -36 20 -10 26', { stroke: C.goldLight, strokeWidth: 5 }) +
    path('M332 508 c30 -20 36 20 10 26', { stroke: C.goldLight, strokeWidth: 5 }) +
    ellipse(240, 300, 22, 30, { stroke: C.goldLight, strokeWidth: 7 }) +
    line(214, 340, 266, 340, { stroke: C.goldLight, strokeWidth: 7 }) +
    line(240, 330, 240, 660, { stroke: C.goldLight, strokeWidth: 7 }) +
    circle(370, 640, 32, { fill: C.gold, stroke: C.goldDeep, strokeWidth: 3 }) +
    line(370, 590, 370, 610, { stroke: C.gold, strokeWidth: 5 }) +
    line(360, 598, 380, 598, { stroke: C.gold, strokeWidth: 5 }),

  'the-hierophant':
    pillar(80, 230, 880, 56, C.stone) +
    pillar(464, 230, 880, 56, C.stone) +
    path('M240 360 h120 l-10 -40 h-100z', { fill: C.gold, stroke: C.goldDeep, strokeWidth: 2 }) +
    path('M250 320 h100 l-10 -38 h-80z', { fill: C.goldLight, stroke: C.goldDeep, strokeWidth: 2 }) +
    path('M260 282 h80 l-12 -36 h-56z', { fill: C.gold, stroke: C.goldDeep, strokeWidth: 2 }) +
    line(300, 246, 300, 216, { strokeWidth: 5 }) + line(288, 228, 312, 228, { strokeWidth: 5 }) +
    line(300, 420, 300, 700, { stroke: C.goldLight, strokeWidth: 7 }) +
    [440, 470, 500].map((y, i) => line(300 - (30 - i * 6), y, 300 + (30 - i * 6), y, { stroke: C.goldLight, strokeWidth: 7 })).join('') +
    group('rotate(-35 300 780)', circle(300, 700, 22, { fill: C.gold, strokeWidth: 3 }), line(300, 722, 300, 840, { strokeWidth: 7 }), rect(300, 812, 24, 12, { fill: C.gold, strokeWidth: 2 })) +
    group('rotate(35 300 780)', circle(300, 700, 22, { fill: C.ivory, strokeWidth: 3 }), line(300, 722, 300, 840, { stroke: C.ivory, strokeWidth: 7 }), rect(276, 812, 24, 12, { fill: C.ivory, strokeWidth: 2 })),

  'the-lovers':
    rays(300, 230, 56, 100, 20) +
    circle(300, 230, 48, { fill: C.goldLight }) +
    path('M300 340 C220 300 140 320 90 380 C150 370 170 400 130 430 C190 410 220 430 190 470 C250 440 290 420 300 400Z', { fill: C.red, stroke: C.gold, strokeWidth: 3 }) +
    path('M300 340 C380 300 460 320 510 380 C450 370 430 400 470 430 C410 410 380 430 410 470 C350 440 310 420 300 400Z', { fill: C.red, stroke: C.gold, strokeWidth: 3 }) +
    path('M300 500 L390 860 H210Z', { fill: C.violet, stroke: C.goldDeep, strokeWidth: 3 }) +
    ground(840, C.greenDark) +
    line(130, 860, 130, 620, { stroke: C.earth, strokeWidth: 10 }) +
    [[130, 600], [100, 640], [160, 640], [110, 690], [150, 690], [130, 730]].map(([x, y]) => flame(x!, y!, 0.9)).join('') +
    line(470, 860, 470, 640, { stroke: C.earth, strokeWidth: 10 }) +
    circle(470, 600, 70, { fill: C.green, stroke: C.goldDeep, strokeWidth: 2 }) +
    [[440, 580], [495, 570], [470, 630], [430, 620], [505, 620]].map(([x, y]) => circle(x!, y!, 9, { fill: C.red, stroke: 'none' })).join('') +
    path('M470 840 c-26 -16 26 -32 0 -48 c-26 -16 26 -32 0 -48 c-20 -12 0 -30 14 -26', { stroke: C.green, strokeWidth: 6 }),

  'the-chariot':
    rect(120, 210, 360, 80, { fill: C.blue, stroke: C.gold, strokeWidth: 3 }) +
    [[160, 240], [220, 260], [280, 236], [340, 262], [400, 240], [450, 262]].map(([x, y]) => star(x!, y!, 10, 4, 6)).join('') +
    line(140, 290, 140, 560, { strokeWidth: 5 }) + line(460, 290, 460, 560, { strokeWidth: 5 }) +
    path('M100 470 h60 v-30 h20 v30 h40 v-50 h20 v50 h120 v-40 h20 v40 h40 v-30 h20 v30 h40 v40 h-400z', { fill: C.stoneDark, stroke: C.goldDeep, strokeWidth: 2 }) +
    crescent(200, 380, 30) + group('translate(800 0) scale(-1 1)', crescent(400, 380, 30)) +
    rect(130, 540, 340, 170, { fill: C.stone, stroke: C.gold, strokeWidth: 4, rx: 6 }) +
    circle(300, 610, 26, { fill: C.gold, stroke: C.goldDeep, strokeWidth: 2 }) +
    path('M274 610 C230 590 200 600 180 620 C220 618 250 626 274 616Z', { fill: C.goldLight, stroke: C.goldDeep, strokeWidth: 2 }) +
    path('M326 610 C370 590 400 600 420 620 C380 618 350 626 326 616Z', { fill: C.goldLight, stroke: C.goldDeep, strokeWidth: 2 }) +
    [[190, C.ink], [410, C.ivory]].map(([x, fill]) =>
      path(`M${x as number - 70} 870 q0 -70 70 -80 q70 10 70 80z`, { fill: fill as string, stroke: C.gold, strokeWidth: 3 }) +
      path(`M${x as number - 26} 790 l26 -50 l26 50z`, { fill: fill as string, stroke: C.gold, strokeWidth: 3 }) +
      circle(x as number, 770, 18, { fill: fill as string, stroke: C.gold, strokeWidth: 3 }),
    ).join(''),

  'strength':
    infinity(300, 220, 1) +
    star(300, 560, 160, 132, 24, { fill: '#B07A3A', stroke: C.gold, strokeWidth: 3 }) +
    circle(236, 486, 22, { fill: '#D9AE62', stroke: C.goldDeep, strokeWidth: 3 }) +
    circle(364, 486, 22, { fill: '#D9AE62', stroke: C.goldDeep, strokeWidth: 3 }) +
    circle(300, 560, 96, { fill: '#D9AE62', stroke: C.goldDeep, strokeWidth: 3 }) +
    path('M252 530 q16 -10 30 0 M318 530 q16 -10 30 0', { stroke: C.ink, strokeWidth: 5 }) +
    ellipse(300, 600, 46, 36, { fill: '#EBCB8B', stroke: C.goldDeep, strokeWidth: 2 }) +
    path('M282 574 h36 l-18 20z', { fill: C.earth, stroke: 'none' }) +
    path('M300 594 v14 M300 608 q-14 10 -26 4 M300 608 q14 10 26 4', { stroke: C.earth, strokeWidth: 3 }) +
    Array.from({ length: 9 }, (_, i) => {
      const a = rad(200 - (i * 220) / 8);
      return rose(300 + 180 * Math.cos(a), 640 + 90 * Math.sin(a), 0.75, i % 2 ? C.ivory : C.red);
    }).join('') +
    ground(820, C.greenDark),

  'the-hermit':
    [[110, 230], [180, 300], [480, 220], [520, 330], [420, 290]].map(([x, y]) => star(x!, y!, 7, 3, 4)).join('') +
    mountains('60 760 L170 610 L230 680 L320 560 L420 690 L480 640 L540 720', C.stoneDark) +
    path('M170 610 L200 650 L215 640 L230 680 M320 560 L350 610 L365 598 L385 640', { stroke: C.ivory, strokeWidth: 6 }) +
    ground(860, C.ivory) +
    line(210, 270, 236, 880, { stroke: C.earth, strokeWidth: 10 }) +
    circle(390, 340, 120, { fill: C.goldLight, stroke: 'none', opacity: 0.12 }) +
    rays(390, 410, 90, 140, 16, { stroke: C.goldLight, opacity: 0.6 }) +
    line(390, 300, 390, 340, { strokeWidth: 3 }) +
    circle(390, 296, 8) +
    path('M352 340 h76 l10 24 v110 l-10 20 h-76 l-10 -20 v-110z', { fill: C.night, stroke: C.gold, strokeWidth: 4 }) +
    star(390, 420, 34, 20, 6, { fill: C.goldLight }),

  'wheel-of-fortune':
    cloud(110, 230, 1.1) + cloud(490, 230, 1.1) + cloud(110, 820, 1.1) + cloud(490, 820, 1.1) +
    [[110, 220, C.ivory], [490, 220, C.gold], [110, 810, '#8C6A4A'], [490, 810, '#C98B3C']].map(([x, y, c]) => circle(x as number, y as number, 26, { fill: c as string, stroke: C.goldLight, strokeWidth: 3 })).join('') +
    circle(300, 520, 196, { fill: C.violet, stroke: C.gold, strokeWidth: 6 }) +
    circle(300, 520, 146, { stroke: C.gold, strokeWidth: 3 }) +
    circle(300, 520, 56, { fill: C.night, stroke: C.gold, strokeWidth: 3 }) +
    rays(300, 520, 56, 196, 8, { strokeWidth: 4, stroke: C.gold }, false, 22.5) +
    [0, 90, 180, 270].map((d, i) => {
      const x = 300 + 171 * Math.cos(rad(d - 90));
      const y = 520 + 171 * Math.sin(rad(d - 90));
      return [circle(x, y, 12, { fill: C.goldLight, stroke: 'none' }), path(`M${x - 12} ${y + 10} l12 -22 l12 22z`, { fill: C.goldLight, stroke: 'none' }), line(x - 12, y, x + 12, y, { stroke: C.goldLight, strokeWidth: 6 }) + line(x, y - 12, x, y + 12, { stroke: C.goldLight, strokeWidth: 6 }), path(`M${x - 14} ${y} q7 -10 14 0 t14 0`, { stroke: C.goldLight, strokeWidth: 5 })][i];
    }).join('') +
    path('M300 264 l-36 0 l12 -60 l24 -20 l24 20 l12 60z', { fill: '#5F7FB0', stroke: C.gold, strokeWidth: 3 }) +
    line(300, 150, 300, 210, { stroke: C.ivory, strokeWidth: 5 }) +
    path('M88 340 c30 30 -30 60 0 90 c30 30 -30 60 0 90 c30 30 -30 60 0 90', { stroke: C.gold, strokeWidth: 8 }) +
    path('M512 760 c-10 -60 20 -90 0 -150 c-10 -30 10 -50 0 -70', { stroke: C.red, strokeWidth: 12 }),

  'justice':
    rect(150, 230, 300, 620, { fill: C.violetLight, opacity: 0.4, stroke: 'none' }) +
    pillar(80, 230, 880, 56, C.stone) +
    pillar(464, 230, 880, 56, C.stone) +
    sword(300, 200, 330, 18) +
    line(300, 600, 300, 660, { strokeWidth: 6 }) +
    line(160, 660, 440, 660, { strokeWidth: 7 }) +
    circle(300, 660, 10, { fill: C.gold }) +
    [180, 420].map((x) => line(x, 660, x - 40, 760, { strokeWidth: 2 }) + line(x, 660, x + 40, 760, { strokeWidth: 2 }) + path(`M${x - 50} 760 h100 q-10 36 -50 36 q-40 0 -50 -36z`, { fill: C.gold, stroke: C.goldDeep, strokeWidth: 2 })).join(''),

  'the-hanged-man':
    rect(160, 210, 280, 26, { fill: C.earth, stroke: C.gold, strokeWidth: 3, rx: 8 }) +
    rect(160, 210, 26, 690, { fill: C.earth, stroke: C.gold, strokeWidth: 3, rx: 8 }) +
    rect(414, 210, 26, 690, { fill: C.earth, stroke: C.gold, strokeWidth: 3, rx: 8 }) +
    [[200, 204], [380, 204], [178, 400], [428, 520], [178, 650]].map(([x, y]) => ellipse(x!, y!, 14, 7, { fill: C.green, stroke: 'none' })).join('') +
    line(300, 236, 300, 280, { stroke: C.ivory, strokeWidth: 3 }) +
    line(300, 280, 300, 460, { stroke: C.red, strokeWidth: 22 }) +
    path('M300 330 L370 360 L304 430', { stroke: C.red, strokeWidth: 20 }) +
    rect(262, 450, 76, 150, { fill: C.blue, stroke: C.gold, strokeWidth: 3, rx: 14 }) +
    path('M262 470 L230 580 L290 600 M338 470 L370 580 L310 600', { stroke: C.blue, strokeWidth: 16 }) +
    circle(300, 660, 74, { fill: C.goldLight, stroke: 'none', opacity: 0.25 }) +
    rays(300, 660, 52, 80, 16, { stroke: C.goldLight }) +
    circle(300, 650, 34, { fill: C.ivory, stroke: C.gold, strokeWidth: 3 }) +
    ground(870, C.greenDark),

  'death':
    water(720, 3, C.blue) +
    ground(800, C.violet) +
    rect(206, 560, 44, 170, { fill: C.stoneDark, stroke: C.gold, strokeWidth: 3 }) +
    rect(350, 560, 44, 170, { fill: C.stoneDark, stroke: C.gold, strokeWidth: 3 }) +
    path('M206 560 v-16 h11 v16 h11 v-16 h11 v16 h11 M350 560 v-16 h11 v16 h11 v-16 h11 v16 h11', { stroke: C.gold, strokeWidth: 3 }) +
    rays(300, 720, 64, 110, 14, { stroke: C.goldLight }, false, 180) +
    path('M236 720 A64 64 0 0 1 364 720Z', { fill: C.goldLight, stroke: C.gold, strokeWidth: 2 }) +
    line(130, 230, 130, 640, { stroke: C.ivory, strokeWidth: 8 }) +
    path('M134 250 h230 q-24 70 0 140 h-230z', { fill: C.ink, stroke: C.gold, strokeWidth: 3 }) +
    rose(240, 320, 2.1, C.ivory, C.gold) +
    group('rotate(-20 440 840)', path('M400 860 l8 -40 l20 22 l12 -32 l12 32 l20 -22 l8 40z', { fill: C.gold, stroke: C.goldDeep, strokeWidth: 2 })),

  'temperance':
    rect(258, 220, 84, 84, { stroke: C.ivory, strokeWidth: 4 }) +
    path('M300 236 L330 290 H270Z', { fill: C.gold, stroke: C.goldDeep, strokeWidth: 2 }) +
    path('M60 520 Q170 470 300 500 T540 470', { stroke: C.goldDeep, strokeWidth: 2 }) +
    path('M300 900 C260 820 380 760 360 680 C340 600 420 560 440 500', { stroke: C.ivory, strokeWidth: 5, strokeDasharray: '2 12' }) +
    rays(440, 470, 30, 60, 12, { stroke: C.goldLight }) +
    path('M418 480 l6 -26 l10 14 l6 -20 l6 20 l10 -14 l6 26z', { fill: C.goldLight, stroke: C.gold, strokeWidth: 2 }) +
    group('rotate(-30 190 620)', cup(190, 620, 1.3)) +
    group('rotate(12 420 720)', cup(420, 720, 1.3)) +
    path('M206 568 C260 590 330 600 404 660', { stroke: C.blueLight, strokeWidth: 9 }) +
    ellipse(170, 850, 120, 34, { fill: C.blue, stroke: C.blueLight, strokeWidth: 2 }) +
    [[90, 760], [130, 740], [470, 800]].map(([x, y]) => line(x!, y!, x!, y! + 70, { stroke: C.green, strokeWidth: 3 }) + path(`M${x} ${y} q-14 -18 0 -36 q14 18 0 36 q-20 -4 -26 8 M${x} ${y} q20 -4 26 8`, { fill: C.violetLight, stroke: C.violetLight, strokeWidth: 3 })).join(''),

  'the-devil':
    star(300, 270, 70, 27, 5, { fill: 'none', stroke: C.goldLight, strokeWidth: 4 }, 90) +
    circle(300, 270, 82, { stroke: C.goldLight, strokeWidth: 3 }) +
    path('M300 400 C230 340 140 330 70 380 C110 390 110 420 90 440 C140 430 150 460 130 490 C180 470 200 490 190 520 C230 480 270 450 300 440Z', { fill: C.stoneDark, stroke: C.gold, strokeWidth: 3 }) +
    path('M300 400 C370 340 460 330 530 380 C490 390 490 420 510 440 C460 430 450 460 470 490 C420 470 400 490 410 520 C370 480 330 450 300 440Z', { fill: C.stoneDark, stroke: C.gold, strokeWidth: 3 }) +
    path('M268 404 q-26 -40 -8 -78 M332 404 q26 -40 8 -78', { stroke: C.goldLight, strokeWidth: 7 }) +
    rect(220, 600, 160, 120, { fill: C.ink, stroke: C.gold, strokeWidth: 4 }) +
    circle(300, 650, 16, { stroke: C.gold, strokeWidth: 5 }) +
    Array.from({ length: 6 }, (_, i) => ellipse(280 - i * 26, 676 + i * 22, 12, 8, { strokeWidth: 4, transform: `rotate(${30} ${280 - i * 26} ${676 + i * 22})` })).join('') +
    Array.from({ length: 6 }, (_, i) => ellipse(320 + i * 26, 676 + i * 22, 12, 8, { strokeWidth: 4, transform: `rotate(${-30} ${320 + i * 26} ${676 + i * 22})` })).join('') +
    line(470, 470, 440, 560, { stroke: C.earth, strokeWidth: 8 }) +
    group('rotate(180 440 590)', flame(440, 590, 1.1)) +
    ground(880, C.ink),

  'the-tower':
    cloud(120, 240, 1.2, C.stoneDark) + cloud(480, 300, 1, C.stoneDark) +
    path('M42 906 L90 790 L160 820 L210 740 L390 740 L440 810 L500 780 L558 906Z', { fill: C.stoneDark, stroke: C.goldDeep, strokeWidth: 3 }) +
    rect(226, 320, 148, 430, { fill: C.stone, stroke: C.gold, strokeWidth: 4 }) +
    [380, 440, 500, 560, 620, 680].map((y) => line(230, y, 370, y, { stroke: C.stoneDark, strokeWidth: 2 })).join('') +
    path('M226 320 v-20 h24 v20 h25 v-20 h25 v20 h24 v-20 h25 v20 h25 v-20', { stroke: C.gold, strokeWidth: 3 }) +
    [[270, 420], [330, 520], [270, 620]].map(([x, y]) => rect(x! - 14, y! - 24, 28, 48, { fill: C.ink, stroke: C.gold, strokeWidth: 2, rx: 14 }) + flame(x!, y! - 6, 0.7, C.red)).join('') +
    flame(250, 300, 1.1, C.red) + flame(350, 300, 1.2, C.red) + flame(300, 290, 0.9, C.gold) +
    path('M530 140 L420 230 L470 236 L360 312 L392 250 L350 250 L440 160Z', { fill: C.goldLight, stroke: C.gold, strokeWidth: 2 }) +
    group('rotate(-28 220 230)', path('M180 250 l10 -50 l24 26 l16 -36 l16 36 l24 -26 l10 50z', { fill: C.gold, stroke: C.goldDeep, strokeWidth: 2 })) +
    [[120, 420], [160, 520], [110, 620], [470, 460], [440, 560], [490, 650], [150, 330], [460, 380], [180, 700], [420, 690]].map(([x, y]) => drop(x!, y!, 1.1)).join(''),

  'the-star':
    star(300, 270, 92, 34, 8) +
    [[120, 200], [480, 200], [100, 330], [500, 330], [160, 440], [440, 440], [300, 410]].map(([x, y]) => star(x!, y!, 24, 9, 8, { fill: C.ivory })).join('') +
    path('M42 760 Q200 720 330 760 Q420 700 558 690 V906 H42Z', { fill: C.greenDark, stroke: C.goldDeep, strokeWidth: 2 }) +
    ellipse(220, 820, 170, 56, { fill: C.blue, stroke: C.blueLight, strokeWidth: 3 }) +
    ellipse(220, 820, 110, 34, { stroke: C.blueLight, strokeWidth: 2 }) +
    ellipse(220, 820, 50, 14, { stroke: C.blueLight, strokeWidth: 2 }) +
    path('M180 620 q-30 -40 0 -70 q30 30 0 70z', { fill: C.red, stroke: C.gold, strokeWidth: 3 }) +
    path('M172 618 C170 680 200 740 210 806', { stroke: C.blueLight, strokeWidth: 5 }) +
    path('M380 630 q-30 -40 0 -70 q30 30 0 70z', { fill: C.red, stroke: C.gold, strokeWidth: 3 }) +
    [0, 1, 2, 3, 4].map((i) => path(`M392 628 Q${420 + i * 18} ${680 + i * 6} ${400 + i * 30} 760`, { stroke: C.blueLight, strokeWidth: 3 })).join('') +
    line(500, 700, 500, 560, { stroke: C.earth, strokeWidth: 9 }) +
    circle(500, 540, 36, { fill: C.green, stroke: C.goldDeep, strokeWidth: 2 }) +
    path('M490 512 q10 -16 24 -6 l12 -4 l-8 10 q-8 14 -28 0z', { fill: C.red, stroke: 'none' }),

  'the-moon':
    rays(300, 290, 92, 130, 32, { stroke: C.goldLight }, true) +
    circle(300, 290, 84, { fill: C.goldLight, stroke: C.gold, strokeWidth: 3 }) +
    circle(330, 280, 70, { fill: '#E6D28F', stroke: 'none' }) +
    path('M262 230 A70 70 0 0 0 262 350', { stroke: C.goldDeep, strokeWidth: 3 }) +
    [[180, 420], [240, 450], [360, 450], [420, 420], [300, 470], [210, 500], [390, 500]].map(([x, y]) => drop(x!, y!, 1)).join('') +
    rect(80, 470, 60, 220, { fill: C.stoneDark, stroke: C.gold, strokeWidth: 3 }) +
    rect(460, 470, 60, 220, { fill: C.stoneDark, stroke: C.gold, strokeWidth: 3 }) +
    rect(98, 500, 24, 34, { fill: C.goldLight, stroke: 'none', rx: 12 }) + rect(478, 500, 24, 34, { fill: C.goldLight, stroke: 'none', rx: 12 }) +
    path('M42 690 Q300 650 558 690 V906 H42Z', { fill: C.greenDark, stroke: C.goldDeep, strokeWidth: 2 }) +
    path('M300 820 C260 780 340 760 300 720 C270 690 320 670 300 640', { stroke: C.ivory, strokeWidth: 8 }) +
    path('M170 760 l-14 -40 l22 14 l10 -30 l12 30 q18 10 14 30 q-20 8 -44 -4z', { fill: C.ivory, stroke: C.goldDeep, strokeWidth: 2 }) +
    path('M430 760 l14 -40 l-22 14 l-10 -30 l-12 30 q-18 10 -14 30 q20 8 44 -4z', { fill: C.stone, stroke: C.goldDeep, strokeWidth: 2 }) +
    ellipse(300, 860, 150, 40, { fill: C.blue, stroke: C.blueLight, strokeWidth: 3 }) +
    path('M286 870 q14 -30 28 0 l10 -4 m-48 4 l-10 -4 M300 850 v-10', { fill: C.red, stroke: C.red, strokeWidth: 5 }),

  'the-sun':
    rays(300, 360, 124, 200, 24, { stroke: C.goldLight, strokeWidth: 4 }, true) +
    circle(300, 360, 112, { fill: C.goldLight, stroke: C.gold, strokeWidth: 4 }) +
    circle(300, 360, 84, { stroke: C.gold, strokeWidth: 2 }) +
    rect(42, 660, 516, 80, { fill: C.stone, stroke: C.gold, strokeWidth: 3 }) +
    [680, 700, 720].map((y, i) => [0, 1, 2, 3, 4, 5, 6, 7].map((k) => line(60 + k * 64 + (i % 2) * 32, y - 10, 60 + k * 64 + (i % 2) * 32, y + 10, { stroke: C.stoneDark, strokeWidth: 2 })).join('') + line(42, y + 10, 558, y + 10, { stroke: C.stoneDark, strokeWidth: 2 })).join('') +
    [130, 230, 370, 470].map((x) => line(x, 660, x, 600, { stroke: C.green, strokeWidth: 4 }) + star(x, 580, 30, 18, 12, { fill: C.gold, stroke: C.goldDeep }) + circle(x, 580, 13, { fill: C.earth, stroke: 'none' })).join('') +
    ground(800, C.greenDark) +
    line(120, 880, 200, 520, { stroke: C.earth, strokeWidth: 8 }) +
    path('M200 520 C260 500 300 560 380 530 C360 570 380 600 400 620 C330 640 290 590 222 610Z', { fill: C.red, stroke: C.gold, strokeWidth: 3 }),

  'judgement':
    path('M42 760 L130 650 L190 700 L260 620 L330 700 L420 630 L558 760Z', { fill: C.ivory, stroke: C.goldDeep, strokeWidth: 2, opacity: 0.85 }) +
    water(760, 4, C.blue) +
    cloud(170, 260, 1.4) + cloud(300, 230, 1.5) + cloud(430, 260, 1.4) +
    path('M206 290 L346 430 L366 410 L232 266Z', { fill: C.gold, stroke: C.goldDeep, strokeWidth: 2 }) +
    ellipse(366, 432, 16, 44, { fill: C.goldLight, stroke: C.gold, strokeWidth: 3, transform: 'rotate(-45 366 432)' }) +
    rect(250, 340, 70, 70, { fill: C.ivory, stroke: C.gold, strokeWidth: 3, transform: 'rotate(45 285 375)' }) +
    line(285, 345, 285, 405, { stroke: C.red, strokeWidth: 9 }) + line(255, 375, 315, 375, { stroke: C.red, strokeWidth: 9 }) +
    [[150, 830], [300, 850], [450, 830]].map(([x, y]) => rect(x! - 60, y! - 26, 120, 40, { fill: C.stone, stroke: C.gold, strokeWidth: 3, rx: 4 }) + path(`M${x! - 30} ${y! - 30} L${x! - 50} ${y! - 110} M${x! + 30} ${y! - 30} L${x! + 50} ${y! - 110}`, { stroke: C.ivory, strokeWidth: 8 }) + circle(x!, y! - 60, 18, { fill: C.ivory, stroke: C.goldDeep, strokeWidth: 2 })).join(''),

  'the-world':
    [[100, 210, C.ivory], [500, 210, C.gold], [100, 830, '#8C6A4A'], [500, 830, '#C98B3C']].map(([x, y, c]) => cloud(x as number, y as number, 0.9) + circle(x as number, y as number, 28, { fill: c as string, stroke: C.goldLight, strokeWidth: 3 })).join('') +
    ellipse(300, 520, 150, 270, { stroke: C.green, strokeWidth: 22 }) +
    Array.from({ length: 36 }, (_, i) => {
      const a = rad(i * 10);
      const x = 300 + 150 * Math.cos(a);
      const y = 520 + 270 * Math.sin(a);
      return ellipse(x, y, 12, 5, { fill: C.greenDark, stroke: 'none', transform: `rotate(${f(i * 10 + 45)} ${f(x)} ${f(y)})` });
    }).join('') +
    [250, 790].map((y) => path(`M270 ${y - 20} L330 ${y + 20} M330 ${y - 20} L270 ${y + 20}`, { stroke: C.red, strokeWidth: 10 })).join('') +
    circle(300, 390, 30, { fill: C.ivory, stroke: C.gold, strokeWidth: 3 }) +
    path('M300 430 C220 480 380 540 300 600 C230 650 360 690 310 740', { stroke: C.violetLight, strokeWidth: 26 }) +
    wand(220, 560, 250, 470) + wand(380, 560, 350, 470),
};

/** Full SVG document for one card: background, frame, glow and the emblem. */
export function cardSvg(id: string): string {
  const body = ARCHETYPES[id];
  if (!body) throw new Error(`no archetype art for ${id}`);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#261D47"/><stop offset="1" stop-color="#110C20"/></linearGradient>
  <radialGradient id="glow" cx="0.5" cy="0.45" r="0.55"><stop offset="0" stop-color="#4A3B7A" stop-opacity="0.55"/><stop offset="1" stop-color="#110C20" stop-opacity="0"/></radialGradient>
  <clipPath id="field"><rect x="42" y="130" width="516" height="776"/></clipPath>
</defs>
<rect width="${W}" height="${H}" fill="url(#bg)"/>
<rect x="42" y="130" width="516" height="776" fill="url(#glow)"/>
<g clip-path="url(#field)">${body}</g>
<rect x="18" y="18" width="564" height="1000" rx="22" fill="none" stroke="${C.gold}" stroke-width="4"/>
<rect x="42" y="42" width="516" height="952" rx="10" fill="none" stroke="${C.goldDeep}" stroke-width="2"/>
<line x1="42" y1="130" x2="558" y2="130" stroke="${C.goldDeep}" stroke-width="2"/>
<line x1="42" y1="906" x2="558" y2="906" stroke="${C.goldDeep}" stroke-width="2"/>
</svg>`;
}
