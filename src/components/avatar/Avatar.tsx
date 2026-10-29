import { forwardRef, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utilities/cx';
import { getInitials, hashString } from '../../utilities/format';
import styles from './Avatar.module.css';

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  /** Person or object name — used for initials, colour and the accessible name. */
  name?: string;
  /** Image URL. Falls back to initials if it fails to load. */
  src?: string;
  /** Icon shown when there is no image or name. */
  icon?: ReactNode;
  /** @default 'md' */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** `square` suits objects (products, companies). @default 'circle' */
  shape?: 'circle' | 'square';
  /** Presence indicator. */
  presence?: 'online' | 'away' | 'busy' | 'offline';
  /** Accent colour index 1–8. Derived from `name` when omitted. */
  accent?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  /** Treat as decoration (hidden from assistive technology). @default false */
  decorative?: boolean;
}

/** Represents a person or object with an image, initials or icon. */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { name, src, icon, size = 'md', shape = 'circle', presence, accent, decorative = false, className, style, 'aria-label': ariaLabel, ...rest },
  ref,
) {
  const [failed, setFailed] = useState(false);
  const accentIndex = accent ?? (name ? (hashString(name) % 8) + 1 : 8);
  const baseLabel = ariaLabel ?? name;
  const label = baseLabel ? (presence ? `${baseLabel} (${presence})` : baseLabel) : undefined;
  const showImage = src && !failed;
  return (
    <span
      ref={ref}
      role={decorative || !label ? undefined : 'img'}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
      className={cx(styles.avatar, styles[size], shape === 'square' && styles.square, className)}
      style={{ ...style, '--_accent': `var(--eui-color-accent-${accentIndex})` } as CSSProperties}
      {...rest}
    >
      {showImage ? (
        <img className={styles.image} src={src} alt="" onError={() => setFailed(true)} />
      ) : name ? (
        // Initials are drawn with CSS generated content (alt text "") so they never compete with the accessible name.
        <span className={styles.initials} data-initials={getInitials(name)} aria-hidden="true" />
      ) : (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      {presence && <span className={cx(styles.status, styles[presence])} aria-hidden="true" />}
    </span>
  );
});
