import { useCallback, useLayoutEffect, useRef } from 'react';

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : () => {};

/** Returns a stable function that always calls the latest `fn`. */
export function useEventCallback<A extends unknown[], R>(fn: ((...args: A) => R) | undefined): (...args: A) => R | undefined {
  const ref = useRef(fn);
  useIsoLayoutEffect(() => {
    ref.current = fn;
  });
  return useCallback((...args: A) => ref.current?.(...args), []);
}

export { useIsoLayoutEffect };
