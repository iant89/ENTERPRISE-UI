/** C7: the PascalCase JSX element at a 1-based cursor position (the nearest unclosed `<Name` before it). */
export function componentAt(code: string, line: number, column: number): string | null {
  const lines = code.split('\n');
  let offset = 0;
  for (let i = 0; i < Math.min(line - 1, lines.length); i++) offset += lines[i].length + 1;
  offset += column - 1;
  const before = code.slice(0, offset);
  const lineText = lines[line - 1] ?? '';
  // On the tag itself (opening or closing) on this line.
  const onLine = [...lineText.matchAll(/<\/?([A-Z][A-Za-z0-9]*)/g)].find((m) => m.index! <= column - 1 && column - 1 <= m.index! + m[0].length + 40);
  if (onLine && lineText.slice(onLine.index!, column - 1).indexOf('>') < 0) return onLine[1];
  // Otherwise the innermost open element around the cursor.
  const stack: string[] = [];
  for (const m of before.matchAll(/<(\/?)([A-Z][A-Za-z0-9]*)[^>]*?(\/?)>/g)) {
    if (m[1]) { const i = stack.lastIndexOf(m[2]); if (i >= 0) stack.splice(i); } else if (!m[3]) stack.push(m[2]);
  }
  return stack.at(-1) ?? null;
}
