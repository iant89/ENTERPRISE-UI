/** C7 §7.8: one in-memory docs index (library api.json + registry pages, project docs/JSDoc/props). Never persisted. */
import { docs as registry } from '../../../../docs/src/registry';
import type { CatalogItem } from '../../components/catalog/types';

export interface SearchEntry { id: string; group: 'Library' | 'Project'; title: string; text: string; target: string; section?: string }
export interface SearchHit extends SearchEntry { score: number; snippet: string }

export function buildIndex(library: readonly CatalogItem[], project: readonly CatalogItem[], files: Readonly<Record<string, string>>): SearchEntry[] {
  const out: SearchEntry[] = [];
  for (const i of library) {
    const doc = registry.find((d) => d.components.includes(i.name));
    out.push({ id: i.id, group: 'Library', title: i.name, target: i.id, text: [i.description, doc?.summary, ...(doc?.a11y ?? [])].filter(Boolean).join(' ') });
    for (const p of i.props) out.push({ id: `${i.id}#${p.name}`, group: 'Library', title: `${i.name} · ${p.name}`, target: i.id, section: p.name, text: [p.name, p.type, p.description].filter(Boolean).join(' ') });
  }
  for (const i of project) {
    const md = i.docs ? files[i.docs] ?? '' : '';
    out.push({ id: i.id, group: 'Project', title: i.name, target: i.id, text: [i.description, md.replace(/<!--.*?-->/g, '')].filter(Boolean).join(' ') });
    for (const p of i.props) out.push({ id: `${i.id}#${p.name}`, group: 'Project', title: `${i.name} · ${p.name}`, target: i.id, section: p.name, text: [p.name, p.type, p.description].filter(Boolean).join(' ') });
  }
  return out;
}

/** Every query word must match the title or text; title matches rank first. Max `limit` per group. */
export function search(index: readonly SearchEntry[], query: string, limit = 8): { Library: SearchHit[]; Project: SearchHit[] } {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const res = { Library: [] as SearchHit[], Project: [] as SearchHit[] };
  if (!words.length) return res;
  for (const e of index) {
    const t = e.title.toLowerCase();
    const x = e.text.toLowerCase();
    if (!words.every((w) => t.includes(w) || x.includes(w))) continue;
    const score = words.reduce((s, w) => s + (t.startsWith(w) ? 4 : t.includes(w) ? 2 : 1), 0);
    const at = x.indexOf(words[0]);
    const snippet = at < 0 ? e.text.slice(0, 80) : `${at > 30 ? '…' : ''}${e.text.slice(Math.max(0, at - 30), at + 60)}…`;
    res[e.group].push({ ...e, score, snippet });
  }
  for (const g of ['Library', 'Project'] as const) res[g] = res[g].sort((a, b) => b.score - a.score || a.title.localeCompare(b.title)).slice(0, limit);
  return res;
}
