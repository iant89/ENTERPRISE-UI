import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utilities/cx';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import styles from './DynamicSideContent.module.css';

export interface DynamicSideContentProps extends HTMLAttributes<HTMLDivElement> {
  /** Main content. */
  children: ReactNode;
  /** Supplementary side content. */
  sideContent: ReactNode;
  /** Accessible name for the side region. @default 'Additional information' */
  sideContentLabel?: string;
  /** Side placement. @default 'end' */
  sidePosition?: 'start' | 'end';
  /** Breakpoints at which side content is hidden. @default ['sm'] — on phones it moves below unless hidden. */
  hideSideContentOn?: ('sm' | 'md' | 'lg' | 'xl')[];
  /** Hide the side content entirely. @default false */
  hideSideContent?: boolean;
  /** On phones, show only main or only side content. @default 'both' */
  phoneView?: 'both' | 'main' | 'side';
}

/** Main content with supplementary side content that reflows by screen size. */
export const DynamicSideContent = forwardRef<HTMLDivElement, DynamicSideContentProps>(function DynamicSideContent(
  { children, sideContent, sideContentLabel = 'Additional information', sidePosition = 'end', hideSideContentOn = [], hideSideContent = false, phoneView = 'both', className, ...rest },
  ref,
) {
  const bp = useBreakpoint();
  const phone = bp === 'sm';
  const showSide = !hideSideContent && !hideSideContentOn.includes(bp) && !(phone && phoneView === 'main');
  const showMain = !(phone && phoneView === 'side');
  return (
    <div ref={ref} className={cx(styles.root, phone && styles.stacked, sidePosition === 'start' && styles.start, className)} {...rest}>
      {showMain && <div className={styles.main}>{children}</div>}
      {showSide && <aside className={styles.side} aria-label={sideContentLabel}>{sideContent}</aside>}
    </div>
  );
});
