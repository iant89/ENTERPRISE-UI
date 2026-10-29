import { useSyncExternalStore } from 'react';

const subscribe = (cb: () => void) => {
  window.addEventListener('hashchange', cb);
  return () => window.removeEventListener('hashchange', cb);
};
const getPath = () => {
  const hash = window.location.hash.replace(/^#/, '');
  return hash.startsWith('/') ? hash.split('?')[0] : '/';
};

/** Minimal hash router: returns the current path, e.g. `/components/button`. */
export function usePath(): string {
  return useSyncExternalStore(subscribe, getPath, () => '/');
}

export const href = (path: string) => `#${path}`;

export function navigate(path: string) {
  window.location.hash = path;
}
