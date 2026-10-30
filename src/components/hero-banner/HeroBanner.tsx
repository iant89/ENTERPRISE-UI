import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utilities/cx';
import styles from './HeroBanner.module.css';

export interface HeroBannerProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Actions, typically one primary button. */
  actions?: ReactNode;
  /** Decorative background image URL. */
  backgroundImage?: string;
  /** Optional media (illustration) beside the text. */
  media?: ReactNode;
  /** Heading level for the title. @default 2 */
  headingLevel?: 1 | 2 | 3;
  /** @default 'brand' */
  tone?: 'brand' | 'neutral';
}

/** A prominent introduction area for a page or workspace. */
export const HeroBanner = forwardRef<HTMLElement, HeroBannerProps>(function HeroBanner(
  { title, subtitle, actions, backgroundImage, media, headingLevel = 2, tone = 'brand', className, style, ...rest },
  ref,
) {
  const Heading = `h${headingLevel}` as const;
  return (
    <section ref={ref} className={cx(styles.banner, styles[tone], className)} style={backgroundImage ? { backgroundImage: `url(${JSON.stringify(backgroundImage)})`, ...style } : style} {...rest}>
      <div className={styles.text}>
        <Heading className={styles.title}>{title}</Heading>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
      {media && <div className={styles.media} aria-hidden="true">{media}</div>}
    </section>
  );
});
