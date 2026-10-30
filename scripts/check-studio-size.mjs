// Fails when the Studio's initial download grows past its budget. The code editor (Monaco,
// TypeScript worker, Prettier) is lazy-loaded and must stay out of the initial chunks.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';

const BUDGET_KB = 350;
const dir = resolve(import.meta.dirname, '../docs-dist/studio');
const html = readFileSync(resolve(dir, 'index.html'), 'utf8');
const files = [...html.matchAll(/(?:src|href)="\.\/(assets\/[^"]+\.(?:js|css))"/g)].map((m) => m[1]);
if (!files.length) throw new Error('No Studio assets found; run npm run build:docs first.');
let total = 0;
for (const file of files) {
  if (/monaco|editor\.api|ts\.worker|prettier|standalone/i.test(file)) throw new Error(`${file} is in the initial download; the code editor must be lazy-loaded.`);
  const source = readFileSync(resolve(dir, file));
  const size = gzipSync(source).length / 1024;
  total += size;
  console.log(`${file.padEnd(48)} ${size.toFixed(1)} kB gzip`);
}
console.log(`Studio initial download: ${total.toFixed(1)} kB gzip (budget ${BUDGET_KB} kB)`);
if (total > BUDGET_KB) {
  console.error(`Studio initial download is over budget by ${(total - BUDGET_KB).toFixed(1)} kB.`);
  process.exit(1);
}
