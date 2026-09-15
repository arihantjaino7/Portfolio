/**
 * Re-copies the latin variable woff2 files from the Fontsource packages into
 * public/fonts after a dependency upgrade. Node rather than `cp` so it works on
 * Windows as well as macOS and Linux.
 */
import { copyFile, mkdir } from 'node:fs/promises';

const files = [
  ['node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2',
   'public/fonts/manrope-latin-wght-normal.woff2'],
  ['node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2',
   'public/fonts/jetbrains-mono-latin-wght-normal.woff2'],
  ['node_modules/@fontsource-variable/playfair-display/files/playfair-display-latin-wght-normal.woff2',
   'public/fonts/playfair-display-latin-wght-normal.woff2'],
  // Anton ships a single weight, so it is a plain @fontsource package rather
  // than an @fontsource-variable one — hence the different filename shape.
  ['node_modules/@fontsource/anton/files/anton-latin-400-normal.woff2',
   'public/fonts/anton-latin-400-normal.woff2'],
];

await mkdir('public/fonts', { recursive: true });
for (const [from, to] of files) {
  await copyFile(from, to);
  console.log('  ', to);
}
