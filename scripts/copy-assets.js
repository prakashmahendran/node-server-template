/* eslint-disable no-console */
// Copy the non TypeScript files of src (swagger yaml docs, json...) next to the compiled output
const fs = require('fs');
const path = require('path');

const SRC = path.resolve(__dirname, '..', 'src');
const DIST = path.resolve(__dirname, '..', 'dist');

let copied = 0;

function copyAssets(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const source = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      copyAssets(source);
    } else if (!entry.name.endsWith('.ts')) {
      const target = path.join(DIST, path.relative(SRC, source));
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.copyFileSync(source, target);
      copied++;
    }
  }
}

copyAssets(SRC);
console.log(`Copied ${copied} asset file(s) to dist`);
