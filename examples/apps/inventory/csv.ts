/** Builds an RFC 4180 CSV string. */
export function toCsv<T>(rows: T[], columns: { header: string; value: (row: T) => string | number }[]): string {
  const escape = (v: string | number) => {
    const s = String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [columns.map((c) => escape(c.header)).join(','), ...rows.map((r) => columns.map((c) => escape(c.value(r))).join(','))].join('\r\n');
}

/** Triggers a browser download of `content` as `filename`. */
export function downloadFile(filename: string, content: string, type = 'text/csv;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
