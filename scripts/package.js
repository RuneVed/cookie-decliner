#!/usr/bin/env node
// Build a deterministic submission ZIP for addons.mozilla.org.
// Usage: npm run package
import { createWriteStream, existsSync, mkdirSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const archiver = require('archiver');

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const pkg = require(resolve(root, 'package.json'));
const version = pkg.version;

const includes = [
  'manifest.json',
  'popup.html',
  'dist/content-script.js',
  'icons/icon16.svg',
  'icons/icon32.svg',
  'icons/icon48.svg',
  'icons/icon128.svg',
];

for (const rel of includes) {
  const full = resolve(root, rel);
  if (!existsSync(full)) {
    console.error(`[package] Missing required file: ${rel}`);
    if (rel === 'dist/content-script.js') {
      console.error('[package] Run `npm run build` first.');
    }
    process.exit(1);
  }
}

const releaseDir = resolve(root, 'release');
if (!existsSync(releaseDir)) {
  mkdirSync(releaseDir, { recursive: true });
}

const outPath = resolve(releaseDir, `cookie-decliner-firefox-${version}.zip`);
const output = createWriteStream(outPath);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  const { size } = statSync(outPath);
  console.log(`[package] ${outPath}`);
  console.log(`[package] ${archive.pointer()} bytes (${(size / 1024).toFixed(1)} KiB)`);
});

archive.on('warning', (err) => {
  if (err.code === 'ENOENT') {
    console.warn(`[package] warning: ${err.message}`);
  } else {
    throw err;
  }
});

archive.on('error', (err) => { throw err; });
archive.pipe(output);

for (const rel of includes) {
  archive.file(resolve(root, rel), { name: rel.replace(/\\/g, '/') });
}

archive.finalize();
