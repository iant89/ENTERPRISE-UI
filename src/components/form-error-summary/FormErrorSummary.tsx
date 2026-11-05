import { forwardRef, useEffect, useRef, type HTMLAttributes, type MouseEvent } from 'react';
import { cx } from '../../utilities/cx';
import { useMergedRefs } from '../../utilities/refs';
import { useId } from '../../hooks/useId';
import styles from './FormErrorSummary.module.css';
import messageErrorSvg from '../../assets/icons/message-error.svg?raw';
import { svgIcon } from '../../icons/svgIcon';

export interface FormErrorSummaryItem {
  /** Id of the field's control. */
  id: string;
  /** Field name, e.g. "Supplier". */
  label: string;
  /** The error, e.g. "Enter a supplier." */
  message: string;
}

export interface FormErrorSummaryProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Errors in the order the fields appear, e.g. `form.errorList` from useForm. */
  errors: FormErrorSummaryItem[];
  /** Moves focus to the summary whenever this changes while there are errors. Pass `form.submitCount`. */
  focusKey?: unknown;
  /** Heading. Defaults to a count, e.g. "There are 2 problems". */
  title?: string | ((count: number) => string);
  /** Heading level. @default 2 */
  headingLevel?: 2 | 3 | 4;
}

const defaultTitle = (count: number) => (count === 1 ? 'There is a problem' : `There are ${count} problems`);

/**
 * Lists form errors at the top of the form after a failed submit, each linking to its field, and
 * takes focus so screen reader and keyboard users learn what to fix (WCAG 3.3.1).
 */
export const FormErrorSummary = forwardRef<HTMLDivElement, FormErrorSummaryProps>(function FormErrorSummary(
  { errors, focusKey, title = defaultTitle, headingLevel = 2, className, ...rest },
  ref,
) {
  const rootRef = useRef<HTMLDivElement>(null);
  const merged = useMergedRefs(ref, rootRef);
  const titleId = useId(undefined, 'error-summary');
  const count = errors.length;

  useEffect(() => {
    if (focusKey !== undefined && count > 0) rootRef.current?.focus();
    // Only a new submit attempt (focusKey) should move focus, not each change in the error count.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusKey]);

  if (!count) return null;
  const Heading = `h${headingLevel}` as const;
  const focusField = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    target.focus();
    target.scrollIntoView?.({ block: 'center' });
  };
  return (
    <div ref={merged} className={cx(styles.summary, className)} role="alert" aria-labelledby={titleId} tabIndex={-1} {...rest}>
      <Heading id={titleId} className={styles.title}>
        {svgIcon(messageErrorSvg, 'message-error', { 'aria-hidden': "true" })}
        {typeof title === 'function' ? title(count) : title}
      </Heading>
      <ul className={styles.list}>
        {errors.map((e) => (
          <li key={e.id}>
            <a href={`#${e.id}`} onClick={(event) => focusField(event, e.id)}>
              <span className={styles.label}>{e.label}:</span> {e.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
});
