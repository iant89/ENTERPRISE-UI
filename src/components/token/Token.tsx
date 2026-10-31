import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cx } from '../../utilities/cx';
import styles from './Token.module.css';

export interface TokenProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Token text. */
  text: ReactNode;
  /** Shows a delete button when provided. */
  onDelete?: () => void;
  /** Localized delete button name. @default `Remove ${text}` */
  deleteLabel?: string;
  /** @default false */
  /** Hides the remove button. The token can still be focused. */
  readOnly?: boolean;
  /** @default false */
  /** Disables the token. A disabled control cannot be focused or changed. */
  disabled?: boolean;
  /** Selected appearance (for example in a Tokenizer). @default false */
  selected?: boolean;
}

/** A compact removable value, used in multi-value inputs. */
export const Token = forwardRef<HTMLSpanElement, TokenProps>(function Token({ text, onDelete, deleteLabel, readOnly = false, disabled = false, selected = false, className, ...rest }, ref) {
  const removable = !!onDelete && !readOnly;
  return (
    <span ref={ref} className={cx(styles.token, selected && styles.selected, disabled && styles.disabled, className)} {...rest}>
      <span className={styles.text}>{text}</span>
      {removable && (
        <button type="button" className={styles.remove} disabled={disabled} aria-label={deleteLabel ?? `Remove ${typeof text === 'string' ? text : 'token'}`} onClick={onDelete}>
          <X aria-hidden="true" />
        </button>
      )}
    </span>
  );
});
