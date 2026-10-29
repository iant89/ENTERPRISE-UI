import { execFileSync, spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('contrast token audit', () => {
  it('passes current themes and fails for missing or low-contrast tokens', () => {
    const root = mkdtempSync(join(tmpdir(), 'eui-contrast-'));
    try {
      cpSync(resolve('scripts/contrast.mjs'), join(root, 'scripts/contrast.mjs'), { recursive: true });
      cpSync(resolve('src/themes'), join(root, 'src/themes'), { recursive: true });
      const script = join(root, 'scripts/contrast.mjs');
      expect(execFileSync(process.execPath, [script], { encoding: 'utf8' })).toContain('All contrast pairs pass');
      const theme = join(root, 'src/themes/light.css');
      const original = readFileSync(theme, 'utf8');
      writeFileSync(theme, original.replace('--eui-color-on-primary: #ffffff;', '--eui-color-on-primary: var(--missing);'));
      const missing = spawnSync(process.execPath, [script], { encoding: 'utf8' });
      expect(missing.status).toBe(1);
      expect(missing.stdout).toContain('missing or unsupported hex token for on-primary');
      writeFileSync(theme, original.replace('--eui-color-on-primary: #ffffff;', '--eui-color-on-primary: #0a6ed1;'));
      const low = spawnSync(process.execPath, [script], { encoding: 'utf8' });
      expect(low.status).toBe(1);
      expect(low.stdout).toContain('on-primary on primary = 1.00');
    } finally { rmSync(root, { recursive: true, force: true }); }
  });
});
