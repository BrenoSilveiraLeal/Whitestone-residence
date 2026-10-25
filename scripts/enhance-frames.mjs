import sharp from 'sharp';
import { readdir, mkdir, copyFile, rm } from 'node:fs/promises';
import path from 'node:path';

// Run against the original ZIP frames. Re-extract the source sequence before rerunning.
const inputDir = path.resolve(process.argv[2] ?? 'public/assets/Hero1');
const outputDir = path.resolve(process.argv[3] ?? inputDir);
await mkdir(outputDir, { recursive: true });
const names = (await readdir(inputDir)).filter((name) => /^img\d{2}\.webp$/.test(name)).sort();

for (const name of names) {
  const temporaryOutput = path.join(outputDir, `.${name}.processing.webp`);
  await sharp(path.join(inputDir, name))
    .sharpen({ sigma: 1.15, m1: 1.2, m2: 2.2 })
    .webp({ quality: 96, effort: 6, smartSubsample: true })
    .toFile(temporaryOutput);
  await copyFile(temporaryOutput, path.join(outputDir, name));
  await rm(temporaryOutput);
}

console.log(`Enhanced ${names.length} frames into ${outputDir}`);
