import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => cleanup());

// jsdom gaps used by the library.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

class NoopObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
globalThis.ResizeObserver ??= NoopObserver as unknown as typeof ResizeObserver;
globalThis.IntersectionObserver ??= NoopObserver as unknown as typeof IntersectionObserver;
Element.prototype.scrollIntoView ??= function () {};
if (!globalThis.CSS?.escape) {
  (globalThis as { CSS: { escape: (s: string) => string } }).CSS = {
    ...(globalThis.CSS ?? {}),
    escape: (s: string) => s.replace(/[^a-zA-Z0-9_-]/g, (c) => `\\${c}`),
  } as typeof CSS;
}
Element.prototype.setPointerCapture ??= function () {};

// Load the lazy enterprise icon collection once, so components that take icon names render their
// icons synchronously in tests. The lazy path itself is covered in src/icons/icons.test.tsx.
import { icons } from '../src/icons/registry';
await icons.preload('enterprise');
