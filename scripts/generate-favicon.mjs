import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sharp = require('sharp');
const toIco = require('to-ico');

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');
const svgPath = path.join(publicDir, 'favicon.svg');
const svg = fs.readFileSync(svgPath);

const icoSizes = [16, 32, 48, 64, 128, 256];
const pngBuffers = await Promise.all(
  icoSizes.map((size) => sharp(svg).resize(size, size).png().toBuffer()),
);

fs.writeFileSync(path.join(publicDir, 'favicon.ico'), await toIco(pngBuffers));

await sharp(svg).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));

console.log('wrote public/favicon.ico and public/apple-touch-icon.png');
