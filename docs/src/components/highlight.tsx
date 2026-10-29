import type { ReactNode } from 'react';

const TOKEN = new RegExp(
  [
    '(?<comment>\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/|\\{\\/\\*[\\s\\S]*?\\*\\/\\})',
    '(?<string>`(?:\\\\.|[^`])*`|\'(?:\\\\.|[^\'\\n])*\'|"(?:\\\\.|[^"\\n])*")',
    '(?<tag><\\/?[A-Za-z][\\w.]*)',
    '(?<keyword>\\b(?:import|from|export|default|function|return|const|let|var|if|else|true|false|null|undefined|new|await|async|type|interface|extends|as|typeof)\\b)',
    '(?<attr>\\b[a-zA-Z-]+(?==[{"\']))',
    '(?<number>\\b\\d+(?:\\.\\d+)?\\b)',
    '(?<type>\\b[A-Z][A-Za-z0-9]*\\b)',
  ].join('|'),
  'g',
);

/** Tiny TSX/CSS/shell highlighter for documentation snippets. */
export function highlight(code: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const match of code.matchAll(TOKEN)) {
    const index = match.index ?? 0;
    if (index > last) out.push(code.slice(last, index));
    const group = Object.entries(match.groups ?? {}).find(([, v]) => v !== undefined)?.[0] ?? 'plain';
    out.push(
      <span key={i++} className={`tok-${group}`}>
        {match[0]}
      </span>,
    );
    last = index + match[0].length;
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}
