/** Check repository-local Markdown links and fragments; external links are deliberately not fetched. */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const files = ['README.md', 'ROADMAP.md', 'CHANGELOG.md', 'examples/README.md', ...readdirSync(join(root, 'docs')).filter((file) => file.endsWith('.md')).map((file) => `docs/${file}`)].map((file) => join(root, file)).filter(existsSync);
const slug = (text) => text.toLowerCase().replace(/<[^>]*>/g, '').replace(/[`*_~]/g, '').replace(/[^\p{L}\p{N}\s_-]/gu, '').trim().replace(/\s/g, '-');
function anchors(text) {
  const counts = new Map(); const result = new Set(); let fenced = false;
  for (const line of text.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) { fenced = !fenced; continue; }
    if (fenced) continue;
    const heading = /^\s{0,3}#{1,6}\s+(.+?)\s*#*\s*$/.exec(line);
    if (heading) { const base = slug(heading[1]); const index = counts.get(base) ?? 0; counts.set(base, index + 1); result.add(index ? `${base}-${index}` : base); }
    for (const match of line.matchAll(/\bid=["']([^"']+)["']/g)) result.add(match[1]);
  }
  return result;
}
const failures = [];
let checked = 0;
for (const file of files) {
  const content = readFileSync(file, 'utf8'); let fenced = false;
  for (const [lineNumber, line] of content.split('\n').entries()) {
    if (/^\s*(```|~~~)/.test(line)) { fenced = !fenced; continue; }
    if (fenced) continue;
    for (const match of line.matchAll(/!?\[[^\]]*\]\(([^\s)]+)(?:\s+["'][^)]*["'])?\)/g)) {
      const target = match[1].replace(/^<|>$/g, '');
      if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(target)) continue;
      const [path, fragment] = target.split('#');
      let resolved;
      try { resolved = path ? resolve(dirname(file), decodeURIComponent(path)) : file; } catch { failures.push(`${relative(root, file)}:${lineNumber + 1}: malformed link ${target}`); continue; }
      checked++;
      if (!existsSync(resolved)) { failures.push(`${relative(root, file)}:${lineNumber + 1}: missing ${target}`); continue; }
      if (fragment && statSync(resolved).isFile() && extname(resolved).toLowerCase() === '.md') {
        let decoded;
        try { decoded = decodeURIComponent(fragment); } catch { failures.push(`${relative(root, file)}:${lineNumber + 1}: malformed fragment ${target}`); continue; }
        if (!anchors(readFileSync(resolved, 'utf8')).has(decoded)) failures.push(`${relative(root, file)}:${lineNumber + 1}: missing anchor ${target}`);
      }
    }
  }
}
if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
else console.log(`Checked ${checked} local Markdown links across ${files.length} files. External URLs and dynamic site routes are not checked.`);
