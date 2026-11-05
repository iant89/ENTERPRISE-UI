import { forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utilities/cx';
import styles from './Tag.module.css';
import { renderIconSource, type IconSource } from '../../icons/IconSource';

export type TagColorScheme = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  /** Tag text. */
  children: ReactNode;
  /**
   * Non-semantic color scheme (Fiori indication colors 1–10): 1 orange, 2 red, 3 raspberry, 4 purple,
   * 5 indigo, 6 blue, 7 teal, 8 green, 9 dark, 10 grey. Colors follow the active theme.
   * @default 10
   */
  colorScheme?: TagColorScheme;
  /** `1` is a solid tag with light text; `2` is a light tag with colored text and border. @default 1 */
  set?: 1 | 2;
  /** Optional leading icon. */
  icon?: IconSource;
}

const COLORS: Record<TagColorScheme, string> = {
  1: 'var(--eui-color-accent-1)', 2: 'var(--eui-color-accent-2)', 3: 'var(--eui-color-accent-3)', 4: 'var(--eui-color-accent-4)',
  5: 'var(--eui-color-accent-5)', 6: 'var(--eui-color-accent-6)', 7: 'var(--eui-color-accent-7)', 8: 'var(--eui-color-accent-8)',
  9: 'var(--eui-color-text)', 10: 'var(--eui-color-text-secondary)',
};

/**
 * A compact, non-interactive label in one of ten color schemes, for example to mark a trial,
 * productive or test system in the shell bar. Color is decorative; the text carries the meaning.
 */
export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag({ children, colorScheme = 10, set = 1, icon, className, style, ...rest }, ref) {
  return (
    <span ref={ref} className={cx(styles.tag, set === 2 ? styles.set2 : styles.set1, className)} style={{ '--tag-color': COLORS[colorScheme], ...style } as CSSProperties} {...rest}>
      {icon && <span className={styles.icon} aria-hidden="true">{renderIconSource(icon)}</span>}
      <span className={styles.text}>{children}</span>
    </span>
  );
});
