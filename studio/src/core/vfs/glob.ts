/** Minimal globs for the search include/exclude fields: `**`, `*`, `?`, comma-separated lists. */
export function globToRegExp(glob: string): RegExp {
  let re = '';
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === '*' && glob[i + 1] === '*') { re += glob[i + 2] === '/' ? '(?:.*/)?' : '.*'; i += glob[i + 2] === '/' ? 2 : 1; }
    else if (c === '*') re += '[^/]*';
    else if (c === '?') re += '[^/]';
    else re += c.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(`^${re}$`);
}

/** `include`/`exclude` lists → path filter. A bare folder name matches everything under it. */
export function pathFilter(include: string, exclude: string): (path: string) => boolean {
  const list = (s: string) => s.split(',').map((g) => g.trim()).filter(Boolean).map((g) => globToRegExp(/[*?]|\.[a-z]+$/i.test(g) ? g : `${g.replace(/\/$/, '')}/**`));
  const inc = list(include);
  const exc = list(exclude);
  return (p) => (!inc.length || inc.some((r) => r.test(p))) && !exc.some((r) => r.test(p));
}
