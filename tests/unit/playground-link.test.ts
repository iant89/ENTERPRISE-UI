import { describe, expect, it } from 'vitest';
import { decodePlaygroundCode, encodePlaygroundCode, playgroundCodeParam, playgroundHref } from '../../docs/src/playgroundLink';

const sample = "import { Button } from '@enterprise-ui/react';\n\nexport default function Example() {\n  return <Button>Save — ✓ 保存</Button>;\n}\n";

describe('playground links', () => {
  it('round-trips code through compressed, URL-safe encoding', async () => {
    const encoded = await encodePlaygroundCode(sample);
    expect(encoded).toMatch(/^z\.[A-Za-z0-9_-]+$/);
    expect(await decodePlaygroundCode(encoded)).toBe(sample);
  });

  it('compresses large examples and still round-trips them', async () => {
    const large = sample.repeat(2000);
    const encoded = await encodePlaygroundCode(large);
    expect(encoded.length).toBeLessThan(large.length / 20);
    expect(await decodePlaygroundCode(encoded)).toBe(large);
  });

  it('decodes the uncompressed fallback and rejects malformed input', async () => {
    const plain = `u.${Buffer.from(sample).toString('base64url')}`;
    expect(await decodePlaygroundCode(plain)).toBe(sample);
    expect(await decodePlaygroundCode('z.not-valid-deflate')).toBeNull();
    expect(await decodePlaygroundCode('nonsense')).toBeNull();
  });

  it('reads the code parameter from the hash', async () => {
    const href = await playgroundHref(sample);
    expect(href.startsWith('#/playground?code=z.')).toBe(true);
    expect(await decodePlaygroundCode(playgroundCodeParam(href)!)).toBe(sample);
    expect(playgroundCodeParam('#/playground/button')).toBeNull();
  });
});
