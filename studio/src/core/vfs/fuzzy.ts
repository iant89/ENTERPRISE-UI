/** Code Studio C2: Quick Open ranking (UI pending mockups). */
import type { FilePath } from '../../model/project';

export interface FuzzyMatch { path: FilePath; score: number; /** Indices into `path` that matched. */ indices: number[] }

const isBoundary = (path: string, i: number) => i === 0 || /[/_-]/.test(path[i - 1]) || (path[i] >= 'A' && path[i] <= 'Z' && path[i - 1] >= 'a' && path[i - 1] <= 'z');

/**
 * Scores `query` as a subsequence of `path` (case-insensitive). Matches in the file name, at word
 * boundaries and in consecutive runs score higher. `null` when it is not a subsequence.
 */
export function fuzzyScore(query: string, path: FilePath): FuzzyMatch | null {
  const q = query.replace(/\s+/g, '').toLowerCase();
  if (!q) return { path, score: 0, indices: [] };
  const lower = path.toLowerCase();
  const nameStart = path.lastIndexOf('/') + 1;
  // Prefer a match that starts as late as possible inside the file name: try greedy from each start.
  let best: FuzzyMatch | null = null;
  for (let start = 0; start < lower.length; start++) {
    if (lower[start] !== q[0]) continue;
    for (const preferBoundary of [false, true]) {
    const indices: number[] = [start];
    let j = 1;
    for (let i = start + 1; i < lower.length && j < q.length; i++) {
      if (lower[i] !== q[j]) continue;
      if (preferBoundary && !isBoundary(path, i)) {
        const later = [...lower.slice(i + 1)].findIndex((c, k) => c === q[j] && isBoundary(path, i + 1 + k));
        if (later >= 0) continue;
      }
      indices.push(i); j++;
    }
    if (j < q.length) continue;
    let score = 0;
    indices.forEach((i, k) => {
      score += 1;
      if (i >= nameStart) score += 2;
      if (isBoundary(path, i)) score += 3;
      if (k > 0 && indices[k - 1] === i - 1) score += 4;
    });
    if (indices[0] === nameStart) score += 5;
    if (lower.slice(nameStart).startsWith(q)) score += 10;
    score -= path.length * 0.01;
    if (!best || score > best.score) best = { path, score, indices };
    }
  }
  return best;
}

/** Ranks paths for Quick Open: best score first, then shorter path, then A–Z. Empty query keeps `recent` first. */
export function rankPaths(query: string, paths: readonly FilePath[], { limit = 50, recent = [] as readonly FilePath[] } = {}): FuzzyMatch[] {
  if (!query.trim()) {
    const rest = paths.filter((p) => !recent.includes(p)).sort();
    return [...recent.filter((p) => paths.includes(p)), ...rest].slice(0, limit).map((path) => ({ path, score: 0, indices: [] }));
  }
  return paths
    .map((p) => fuzzyScore(query, p))
    .filter((m): m is FuzzyMatch => !!m)
    .sort((a, b) => b.score - a.score || a.path.length - b.path.length || (a.path < b.path ? -1 : a.path > b.path ? 1 : 0))
    .slice(0, limit);
}
