import { forwardRef, useRef, type HTMLAttributes, type KeyboardEvent } from 'react';
import { cx } from '../../utilities/cx';
import { Token } from './Token';
import styles from './Token.module.css';

export interface TokenizerItem { id: string; text: string; readOnly?: boolean }

export interface TokenizerProps extends Omit<HTMLAttributes<HTMLUListElement>, 'onChange'> {
  /** Tokens to display. */
  tokens: TokenizerItem[];
  /** Called with the id of a token to remove (delete button, Backspace or Delete). */
  onTokenDelete?: (id: string) => void;
  /** Accessible list name. */
  'aria-label': string;
  /** @default false */
  /** Hides the remove buttons. The tokens can still be focused. */
  readOnly?: boolean;
  /** @default false */
  /** Disables the tokenizer. A disabled control cannot be focused or changed. */
  disabled?: boolean;
  /** Localized delete-button name. */
  deleteLabel?: (text: string) => string;
}

/** A labelled, keyboard-navigable list of tokens. */
export const Tokenizer = forwardRef<HTMLUListElement, TokenizerProps>(function Tokenizer(
  { tokens, onTokenDelete, readOnly = false, disabled = false, deleteLabel = (t) => `Remove ${t}`, className, ...rest },
  ref,
) {
  const items = useRef<(HTMLSpanElement | null)[]>([]);
  const onKey = (event: KeyboardEvent<HTMLSpanElement>, index: number, token: TokenizerItem) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const delta = event.key === 'ArrowRight' ? 1 : -1;
      items.current[Math.max(0, Math.min(tokens.length - 1, index + delta))]?.focus();
    } else if ((event.key === 'Backspace' || event.key === 'Delete') && !readOnly && !disabled && !token.readOnly && onTokenDelete) {
      event.preventDefault();
      onTokenDelete(token.id);
      items.current[Math.max(0, index - 1)]?.focus();
    }
  };
  return (
    <ul ref={ref} className={cx(styles.tokenizer, className)} {...rest}>
      {tokens.map((token, index) => (
        <li key={token.id}>
          <Token
            ref={(el) => { items.current[index] = el; }}
            tabIndex={disabled ? undefined : 0}
            className={styles.focusable}
            text={token.text}
            readOnly={readOnly || token.readOnly}
            disabled={disabled}
            deleteLabel={deleteLabel(token.text)}
            onDelete={onTokenDelete ? () => onTokenDelete(token.id) : undefined}
            onKeyDown={(e) => onKey(e, index, token)}
          />
        </li>
      ))}
    </ul>
  );
});
