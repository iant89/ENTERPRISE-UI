export const Keys = {
  Enter: 'Enter',
  Space: ' ',
  Escape: 'Escape',
  Tab: 'Tab',
  ArrowUp: 'ArrowUp',
  ArrowDown: 'ArrowDown',
  ArrowLeft: 'ArrowLeft',
  ArrowRight: 'ArrowRight',
  Home: 'Home',
  End: 'End',
  PageUp: 'PageUp',
  PageDown: 'PageDown',
  Backspace: 'Backspace',
  Delete: 'Delete',
} as const;

export type Orientation = 'horizontal' | 'vertical' | 'both';

interface NavigationOptions {
  orientation?: Orientation;
  loop?: boolean;
  isDisabled?: (index: number) => boolean;
  /** Reverse horizontal arrows for right-to-left layouts. */
  rtl?: boolean;
}

/**
 * Resolves the next index for list-style arrow-key navigation, skipping
 * disabled entries. Returns `null` when the key is not a navigation key.
 */
export function getNavigationIndex(
  key: string,
  current: number,
  count: number,
  { orientation = 'vertical', loop = true, isDisabled = () => false, rtl = false }: NavigationOptions = {},
): number | null {
  if (count === 0) return null;
  const forwardKeys: string[] = [];
  const backwardKeys: string[] = [];
  if (orientation !== 'horizontal') {
    forwardKeys.push(Keys.ArrowDown);
    backwardKeys.push(Keys.ArrowUp);
  }
  if (orientation !== 'vertical') {
    forwardKeys.push(rtl ? Keys.ArrowLeft : Keys.ArrowRight);
    backwardKeys.push(rtl ? Keys.ArrowRight : Keys.ArrowLeft);
  }

  const step = (from: number, dir: 1 | -1): number => {
    let index = from;
    for (let i = 0; i < count; i++) {
      index += dir;
      if (index >= count) {
        if (!loop) return from;
        index = 0;
      } else if (index < 0) {
        if (!loop) return from;
        index = count - 1;
      }
      if (!isDisabled(index)) return index;
    }
    return from;
  };

  if (forwardKeys.includes(key)) return step(current, 1);
  if (backwardKeys.includes(key)) return step(current, -1);
  if (key === Keys.Home) return isDisabled(0) ? step(0, 1) : 0;
  if (key === Keys.End) return isDisabled(count - 1) ? step(count - 1, -1) : count - 1;
  return null;
}

/**
 * Finds the first item after `from` whose label starts with `query`
 * (case-insensitive) — used for type-ahead in menus, lists and trees.
 */
export function findTypeaheadIndex(labels: string[], query: string, from: number, isDisabled: (i: number) => boolean = () => false): number {
  const q = query.toLocaleLowerCase();
  const count = labels.length;
  for (let offset = 1; offset <= count; offset++) {
    const index = (from + offset) % count;
    if (!isDisabled(index) && labels[index]?.toLocaleLowerCase().startsWith(q)) return index;
  }
  return -1;
}
