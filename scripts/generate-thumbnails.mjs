#!/usr/bin/env node
/**
 * Generate low-res thumbnails for template previews.
 * Requires: sharp
 * Usage: node scripts/generate-thumbnails.mjs srcDir outDir
 * Example: node scripts/generate-thumbnails.mjs public/screenshots public/thumbs
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const [,, inDir, outDir] = process.argv;
if (!inDir || !outDir) {
  console.error('Usage: node scripts/generate-thumbnails.mjs <inputDir> <outputDir>');
  process.exit(1);
}

if (!fs.existsSync(inDir)) {
  console.error('Input directory does not exist:', inDir);
  process.exit(1);
}
fs.mkdirSync(outDir, { recursive: true });

const manifest = [];
const files = fs.readdirSync(inDir).filter(f => /(png|jpg|jpeg)$/i.test(f));

for (const file of files) {
  const src = path.join(inDir, file);
  const base = file.replace(/\.(png|jpg|jpeg)$/i, '');
  const outPng = path.join(outDir, base + '-thumb.png');
  const outWebp = path.join(outDir, base + '-thumb.webp');
  try {
    const image = sharp(src).resize({ width: 480 }).withMetadata();
    await image.png({ quality: 70 }).toFile(outPng);
    await image.webp({ quality: 70 }).toFile(outWebp);
    manifest.push({ source: file, thumbnailPng: path.basename(outPng), thumbnailWebp: path.basename(outWebp), width: 480 });
    console.log('Generated thumbnails for', file);
  } catch (err) {
    console.error('Failed processing', file, err);
  }
}

const manifestPath = path.join(outDir, 'thumbnails.json');
fs.writeFileSync(manifestPath, JSON.stringify({ generatedAt: new Date().toISOString(), items: manifest }, null, 2));
console.log('Manifest written to', manifestPath);
