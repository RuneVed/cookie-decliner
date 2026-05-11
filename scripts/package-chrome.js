#!/usr/bin/env node
// Build a deterministic submission ZIP for the Chrome Web Store.
// Usage: npm run package:chrome
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
  'icons/icon16.png',
  'icons/icon32.png',
  'icons/icon48.png',
  'icons/icon128.png',
];

for (const rel of includes) {
  const full = resolve(root, rel);
  if (!existsSync(full)) {
    console.error(`[package:chrome] Missing required file: ${rel}`);
    if (rel === 'dist/content-script.js') {
      console.error('[package:chrome] Run `npm run build` first.');
    }
    if (rel.endsWith('.png')) {
      console.error('[package:chrome] Run `npm run icons` first.');
    }
    process.exit(1);
  }
}

const releaseDir = resolve(root, 'release');
if (!existsSync(releaseDir)) {
  mkdirSync(releaseDir, { recursive: true });
}

const outPath = resolve(releaseDir, `cookie-decliner-chrome-${version}.zip`);
const output = createWriteStream(outPath);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  const { size } = statSync(outPath);
  console.log(`[package:chrome] ${outPath}`);
  console.log(`[package:chrome] ${archive.pointer()} bytes (${(size / 1024).toFixed(1)} KiB)`);
});

archive.on('warning', (err) => {
  if (err.code === 'ENOENT') {
    console.warn(`[package:chrome] warning: ${err.message}`);
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
