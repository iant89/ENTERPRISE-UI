import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../../utilities/cx';
import styles from './Kbd.module.css';

export interface KbdProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** Keys pressed together, e.g. `['Mod', 'K']` or `'Shift+?'`. `Mod` shows ⌘ on Apple devices and Ctrl elsewhere. */
  keys: string | string[];
  /** Force the Apple (`mac`) or other (`other`) key names. Defaults to the current device. */
  platform?: 'mac' | 'other';
  /** Size. @default 'md' */
  size?: 'sm' | 'md';
}

const isMac = () => typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

const SYMBOLS: Record<string, { mac: string; other: string; name: string }> = {
  mod: { mac: '⌘', other: 'Ctrl', name: 'Command' },
  cmd: { mac: '⌘', other: 'Ctrl', name: 'Command' },
  ctrl: { mac: '⌃', other: 'Ctrl', name: 'Control' },
  control: { mac: '⌃', other: 'Ctrl', name: 'Control' },
  alt: { mac: '⌥', other: 'Alt', name: 'Option' },
  option: { mac: '⌥', other: 'Alt', name: 'Option' },
  shift: { mac: '⇧', other: 'Shift', name: 'Shift' },
  enter: { mac: '↵', other: 'Enter', name: 'Enter' },
  escape: { mac: 'Esc', other: 'Esc', name: 'Escape' },
  esc: { mac: 'Esc', other: 'Esc', name: 'Escape' },
  arrowup: { mac: '↑', other: '↑', name: 'Up arrow' },
  arrowdown: { mac: '↓', other: '↓', name: 'Down arrow' },
  arrowleft: { mac: '←', other: '←', name: 'Left arrow' },
  arrowright: { mac: '→', other: '→', name: 'Right arrow' },
  backspace: { mac: '⌫', other: 'Backspace', name: 'Backspace' },
  delete: { mac: '⌦', other: 'Del', name: 'Delete' },
  tab: { mac: '⇥', other: 'Tab', name: 'Tab' },
  space: { mac: 'Space', other: 'Space', name: 'Space' },
};

/** Splits "Ctrl+Shift+K" (but keeps a lone "+" key). */
export const parseKeys = (keys: string | string[]) => (Array.isArray(keys) ? keys : keys.split(/\+(?!$)/));

/** Accessible text of a shortcut, e.g. "Control plus K" on Windows. */
export function describeKeys(keys: string | string[], platform: 'mac' | 'other' = isMac() ? 'mac' : 'other'): string {
  return parseKeys(keys)
    .map((k) => {
      const s = SYMBOLS[k.toLowerCase()];
      if (!s) return k;
      return platform === 'mac' ? s.name : s.other === 'Ctrl' ? 'Control' : s.name;
    })
    .join(' plus ');
}

/** A keyboard shortcut, shown as key caps and read as words ("Control plus K"). */
export const Kbd = forwardRef<HTMLElement, KbdProps>(function Kbd({ keys, platform, size = 'md', className, ...rest }, ref) {
  const mac = platform ? platform === 'mac' : isMac();
  const list = parseKeys(keys);
  return (
    <kbd ref={ref} className={cx(styles.combo, styles[size], className)} {...rest}>
      <span aria-hidden="true" className={styles.caps}>
        {list.map((k, i) => {
          const s = SYMBOLS[k.toLowerCase()];
          return (
            <kbd key={i} className={styles.key}>
              {s ? (mac ? s.mac : s.other) : k.length === 1 ? k.toUpperCase() : k}
            </kbd>
          );
        })}
      </span>
      <span className="eui-visually-hidden">{describeKeys(list, mac ? 'mac' : 'other')}</span>
    </kbd>
  );
});
