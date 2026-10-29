import { cloneElement, type ReactElement, type Ref } from 'react';
import { getElementRef, mergeRefs } from './refs';

type AnyProps = Record<string, unknown>;

/**
 * Clones a trigger element, merging refs and chaining event handlers so the
 * element's own handlers run first (and can `preventDefault()` ours).
 */
export function cloneTrigger<T extends HTMLElement>(element: ReactElement, ref: Ref<T>, props: AnyProps): ReactElement {
  const own = element.props as AnyProps;
  const merged: AnyProps = { ...props };
  for (const key of Object.keys(props)) {
    const theirs = own[key];
    const ours = props[key];
    if (/^on[A-Z]/.test(key) && typeof theirs === 'function' && typeof ours === 'function') {
      merged[key] = (event: { defaultPrevented?: boolean }) => {
        (theirs as (e: unknown) => void)(event);
        if (!event?.defaultPrevented) (ours as (e: unknown) => void)(event);
      };
    }
  }
  return cloneElement(element, { ...merged, ref: mergeRefs(getElementRef<T>(element), ref) } as AnyProps);
}
