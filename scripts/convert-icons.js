#!/usr/bin/env node
// Convert icon SVGs in icons/ to PNGs at native sizes (16/32/48/128).
// Chrome Web Store requires PNG; Firefox accepts both.
// Usage: npm run icons
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = resolve(__dirname, '..', 'icons');

const sizes = [16, 32, 48, 128];

for (const size of sizes) {
  const svgPath = resolve(iconsDir, `icon${size}.svg`);
  const pngPath = resolve(iconsDir, `icon${size}.png`);
  const svg = readFileSync(svgPath);
  await sharp(svg, { density: 384 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(pngPath);
  console.log(`[icons] ${pngPath}`);
}
