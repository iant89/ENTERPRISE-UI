import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from './cx';

export interface VisuallyHiddenProps extends HTMLAttributes<HTMLSpanElement> {}

/** Renders content that is announced by screen readers but not shown. */
export const VisuallyHidden = forwardRef<HTMLSpanElement, VisuallyHiddenProps>(function VisuallyHidden(
  { className, ...rest },
  ref,
) {
  return <span ref={ref} className={cx('eui-visually-hidden', className)} {...rest} />;
});
