#!/usr/bin/env node
// Build the AMO source-code submission ZIP.
// Usage: npm run package:source
import { createWriteStream, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const archiver = require('archiver');

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const pkg = require(resolve(root, 'package.json'));
const version = pkg.version;

const includeDirs = ['src', 'tests', 'icons', 'scripts', 'docs'];

const includeFiles = [
  'manifest.json',
  'popup.html',
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'eslint.config.js',
  'jest.config.js',
  'playwright.config.ts',
  'README.md',
  'LICENSE',
  'PRIVACY.md',
  'CHANGELOG.md',
  'privacy-policy.html',
];

const excludeRegexes = [
  /(^|\/)node_modules(\/|$)/,
  /(^|\/)dist(\/|$)/,
  /(^|\/)coverage(\/|$)/,
  /(^|\/)\.git(\/|$)/,
  /(^|\/)release(\/|$)/,
  /(^|\/)playwright-report(\/|$)/,
  /(^|\/)test-results(\/|$)/,
  /\.log$/,
  /\.tsbuildinfo$/,
];

function isExcluded(relPath) {
  const posix = relPath.split(sep).join('/');
  return excludeRegexes.some((re) => re.test(posix));
}

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    const rel = relative(root, full);
    if (isExcluded(rel)) continue;
    if (entry.isDirectory()) {
      yield* walk(full);
    } else if (entry.isFile()) {
      yield { full, rel };
    }
  }
}

const releaseDir = resolve(root, 'release');
if (!existsSync(releaseDir)) mkdirSync(releaseDir, { recursive: true });

const outPath = resolve(releaseDir, `cookie-decliner-source-${version}.zip`);
const output = createWriteStream(outPath);
const archive = archiver('zip', { zlib: { level: 9 } });

let fileCount = 0;

output.on('close', () => {
  const { size } = statSync(outPath);
  console.log(`[package:source] ${outPath}`);
  console.log(`[package:source] ${fileCount} files, ${archive.pointer()} bytes (${(size / 1024).toFixed(1)} KiB)`);
  if (size < 5 * 1024) {
    console.warn('[package:source] archive is unexpectedly small; review contents.');
  }
});

archive.on('warning', (err) => {
  if (err.code === 'ENOENT') {
    console.warn(`[package:source] warning: ${err.message}`);
  } else {
    throw err;
  }
});

archive.on('error', (err) => { throw err; });
archive.pipe(output);

for (const rel of includeFiles) {
  const full = resolve(root, rel);
  if (existsSync(full)) {
    archive.file(full, { name: rel.split(sep).join('/') });
    fileCount++;
  } else {
    console.warn(`[package:source] skipping missing file: ${rel}`);
  }
}

for (const dir of includeDirs) {
  const full = resolve(root, dir);
  if (!existsSync(full)) {
    console.warn(`[package:source] skipping missing dir: ${dir}`);
    continue;
  }
  for (const { full: fileFull, rel } of walk(full)) {
    archive.file(fileFull, { name: rel.split(sep).join('/') });
    fileCount++;
  }
}

archive.finalize();
