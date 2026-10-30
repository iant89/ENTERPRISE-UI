/**
 * Encodes example source for the playground URL (`#/playground?code=…`).
 * Code is deflate-compressed and base64url-encoded (`z.` prefix). Browsers without
 * CompressionStream fall back to plain UTF-8 base64url (`u.` prefix). Very large
 * snippets are kept in sessionStorage and referenced by key (`s.` prefix), so the URL stays short.
 */
const MAX_URL_PAYLOAD = 30_000;
const STORAGE_PREFIX = 'eui-playground-snippet:';

const toBase64Url = (bytes: Uint8Array) => {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const fromBase64Url = (text: string) => {
  const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (text.length % 4)) % 4));
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
};

async function transformBytes(bytes: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const writer = stream.writable.getWriter();
  void writer.write(bytes as Uint8Array<ArrayBuffer>).then(() => writer.close()).catch(() => undefined);
  const reader = stream.readable.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    length += value.length;
  }
  const result = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.length; }
  return result;
}

const canCompress = () => typeof CompressionStream === 'function' && typeof DecompressionStream === 'function';

export async function encodePlaygroundCode(code: string): Promise<string> {
  const bytes = new TextEncoder().encode(code);
  const payload = canCompress() ? `z.${toBase64Url(await transformBytes(bytes, new CompressionStream('deflate-raw')))}` : `u.${toBase64Url(bytes)}`;
  if (payload.length <= MAX_URL_PAYLOAD || typeof sessionStorage === 'undefined') return payload;
  const key = Math.random().toString(36).slice(2, 10);
  sessionStorage.setItem(STORAGE_PREFIX + key, code);
  return `s.${key}`;
}

/** Decodes a value produced by `encodePlaygroundCode`. Returns `null` for malformed or expired input. */
export async function decodePlaygroundCode(value: string): Promise<string | null> {
  try {
    const [kind, data] = [value.slice(0, 2), value.slice(2)];
    if (kind === 's.') return sessionStorage.getItem(STORAGE_PREFIX + data);
    if (kind === 'u.') return new TextDecoder().decode(fromBase64Url(data));
    if (kind === 'z.' && canCompress()) return new TextDecoder().decode(await transformBytes(fromBase64Url(data), new DecompressionStream('deflate-raw')));
    return null;
  } catch {
    return null;
  }
}

/** Reads the `code` parameter from the current hash, for example `#/playground?code=z.…`. */
export function playgroundCodeParam(hash = typeof window === 'undefined' ? '' : window.location.hash): string | null {
  const query = hash.split('?')[1];
  return query ? new URLSearchParams(query).get('code') : null;
}

export async function playgroundHref(code: string): Promise<string> {
  return `#/playground?code=${await encodePlaygroundCode(code)}`;
}
