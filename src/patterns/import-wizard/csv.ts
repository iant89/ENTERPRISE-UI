const candidates = [',', ';', '\t', '|'] as const;

/** Picks the delimiter that occurs most often outside quotes in the first line. */
export function detectDelimiter(text: string): string {
  const counts = new Map<string, number>(candidates.map((c) => [c, 0]));
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') quoted = !quoted;
    else if (!quoted && (ch === '\n' || ch === '\r')) break;
    else if (!quoted && counts.has(ch)) counts.set(ch, counts.get(ch)! + 1);
  }
  let best = ',';
  for (const [c, n] of counts) if (n > counts.get(best)!) best = c;
  return best;
}

/**
 * Parses delimited text (RFC 4180 CSV, or semicolon / tab / pipe separated)
 * into rows of cells. Handles quoted cells, escaped quotes (`""`), line breaks
 * inside quotes, CRLF line endings and a UTF-8 byte-order mark. Fully empty
 * lines are dropped and rows are padded to the widest row.
 */
export function parseDelimited(input: string, delimiter = detectDelimiter(input.replace(/^\uFEFF/, ''))): string[][] {
  const text = input.replace(/^\uFEFF/, '');
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  const endRow = () => {
    row.push(cell);
    cell = '';
    if (row.some((value) => value !== '')) rows.push(row);
    row = [];
  };
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else quoted = false;
      } else cell += ch;
    } else if (ch === '"' && cell === '') quoted = true;
    else if (ch === delimiter) {
      row.push(cell);
      cell = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      endRow();
    } else cell += ch;
  }
  if (cell !== '' || row.length) endRow();
  const width = rows.reduce((max, r) => Math.max(max, r.length), 0);
  return rows.map((r) => (r.length < width ? [...r, ...Array<string>(width - r.length).fill('')] : r));
}

/** Quotes a value for CSV output when needed. */
export function csvCell(value: string): string {
  return /[",\r\n;\t]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}
