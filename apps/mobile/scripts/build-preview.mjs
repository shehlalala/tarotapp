/**
 * Builds a single-file web preview of the app: dist-preview/index.html.
 *
 * The JS bundle is inlined so the page works from any URL or base path (e.g. a
 * shared preview link), and the URL is reset to "/" before the router boots so
 * Expo Router always lands on the reading screen.
 *
 *   pnpm preview:build
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(appDir, 'dist-preview');
const exportDir = mkdtempSync(join(tmpdir(), 'tarot-web-'));

try {
  execFileSync('npx', ['expo', 'export', '--platform', 'web', '--output-dir', exportDir], {
    cwd: appDir,
    stdio: 'inherit',
    env: { ...process.env, CI: '1' },
  });

  const jsDir = join(exportDir, '_expo/static/js/web');
  const bundles = readdirSync(jsDir).filter((f) => f.endsWith('.js'));
  if (bundles.length !== 1) throw new Error(`expected one web bundle, found ${bundles.length}`);
  // Escape "</script" so the bundle cannot close its own <script> tag early.
  const js = readFileSync(join(jsDir, bundles[0]), 'utf8').replace(/<\/script/gi, '<\\/script');

  let html = readFileSync(join(exportDir, 'index.html'), 'utf8');
  html = html.replace(/<script src="[^"]+" defer><\/script>/, '');
  html = html.replace(
    '</style>',
    `  html, body { background: #0E0B16; }\n    </style>`,
  );
  // Function replacer: a string replacement would interpret "$&", "$'" etc. inside the bundle.
  html = html.replace(
    '</body>',
    () => `<script>try { history.replaceState(null, '', '/'); } catch (e) {}</script>\n<script>${js}</script>\n</body>`,
  );

  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'index.html'), html);

  // Fragment variant for hosts that supply their own <html>/<head>/<body> skeleton
  // (e.g. a shared Artifact link): keep the title, styles, root and scripts only.
  const pick = (re) => (html.match(re) ?? [''])[0];
  const fragment = [
    '<title>Past Present Future Tarot</title>',
    pick(/<style id="expo-reset">[\s\S]*?<\/style>/).replace('</style>', '  :root { color-scheme: dark; }\n    </style>'),
    '<div id="root"></div>',
    ...html.match(/<script>[\s\S]*?<\/script>/g),
  ].join('\n');
  writeFileSync(join(outDir, 'preview.html'), fragment);
  console.log(`\nPreview: ${join(outDir, 'index.html')} (${(html.length / 1024 / 1024).toFixed(1)} MB), fragment: preview.html`);
} finally {
  rmSync(exportDir, { recursive: true, force: true });
}
