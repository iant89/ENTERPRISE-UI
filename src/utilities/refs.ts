import { useCallback, type MutableRefObject, type ReactElement, type Ref, type RefCallback } from 'react';

/** Assigns a value to any kind of React ref. */
export function setRef<T>(ref: Ref<T> | undefined | null, value: T | null): void {
  if (typeof ref === 'function') ref(value);
  else if (ref) (ref as MutableRefObject<T | null>).current = value;
}

/** Combines several refs into a single callback ref. */
export function mergeRefs<T>(...refs: Array<Ref<T> | undefined | null>): RefCallback<T> {
  return (value) => {
    for (const ref of refs) setRef(ref, value);
  };
}

/** Memoised {@link mergeRefs}. */
export function useMergedRefs<T>(...refs: Array<Ref<T> | undefined | null>): RefCallback<T> {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(mergeRefs(...refs), refs);
}

/** Reads the ref attached to a React element in both React 18 and 19. */
export function getElementRef<T>(element: ReactElement): Ref<T> | undefined {
  const props = element.props as { ref?: Ref<T> };
  if (props && 'ref' in props) return props.ref;
  return (element as unknown as { ref?: Ref<T> }).ref;
}
