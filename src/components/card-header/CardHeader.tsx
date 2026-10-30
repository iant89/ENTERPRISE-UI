import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utilities/cx';
import styles from './CardHeader.module.css';

export interface CardHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'title' | 'onClick'> {
  /** Heading of the card. */
  title: ReactNode;
  subtitle?: ReactNode;
  additionalText?: ReactNode;
  avatar?: ReactNode;
  /** Actions remain independent from the header activation target. */
  actions?: ReactNode;
  /** @default 3 */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** When supplied, the title is a native button. */
  onPress?: () => void;
}
/** A card heading with optional metadata and independently operable actions. */
export const CardHeader = forwardRef<HTMLElement, CardHeaderProps>(function CardHeader({ title, subtitle, additionalText, avatar, actions, headingLevel = 3, onPress, className, ...rest }, ref) {
  const Heading = `h${headingLevel}` as const;
  return <header {...rest} ref={ref} className={cx(styles.header, className)}>
    {avatar}<div className={styles.text}><Heading className={styles.title}>{onPress ? <button type="button" className={styles.button} onClick={onPress}>{title}</button> : title}</Heading>{subtitle && <div className={styles.subtitle}>{subtitle}</div>}</div>
    {additionalText && <span className={styles.additional}>{additionalText}</span>}{actions && <div className={styles.actions}>{actions}</div>}
  </header>;
});
