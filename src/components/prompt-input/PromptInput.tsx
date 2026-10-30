import { forwardRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Send, Square } from 'lucide-react';
import { cx } from '../../utilities/cx';
import { useControllableState } from '../../hooks/useControllableState';
import { IconButton } from '../icon-button';
import { TextArea, type TextAreaProps } from '../text-area';
import styles from './PromptInput.module.css';

export interface PromptInputProps extends Omit<TextAreaProps, 'value' | 'defaultValue' | 'onChange' | 'onSubmit'> {
  /** The current value. Providing it makes the component controlled; update it from the change callback. */
  value?: string;
  /** @default '' */
  /** The initial value when the component is uncontrolled. */
  defaultValue?: string;
  /** Called with the new value when the user changes it. */
  onChange?: (value: string) => void;
  /** Called with the trimmed prompt on Enter (without Shift) or the send button. */
  onSubmit?: (prompt: string) => void;
  /** Show a Stop button instead of Send while a response is generating. @default false */
  generating?: boolean;
  /** Called when the user stops a running request. The stop button is shown while `loading` is true. */
  onStop?: () => void;
  /** Suggested prompts shown as quick picks. */
  suggestions?: string[];
  /** Clear the input after submitting. @default true */
  clearOnSubmit?: boolean;
  /** Content above the input, e.g. an AI disclaimer. */
  footnote?: ReactNode;
  /** Override strings for localization. */
  labels?: { send: string; stop: string; suggestions: string };
}

/** A multi-line prompt field for AI features with send/stop and suggested prompts. */
export const PromptInput = forwardRef<HTMLTextAreaElement, PromptInputProps>(function PromptInput(
  { value, defaultValue = '', onChange, onSubmit, generating = false, onStop, suggestions = [], clearOnSubmit = true, footnote, labels = { send: 'Send', stop: 'Stop generating', suggestions: 'Suggested prompts' }, disabled, className, onKeyDown, ...rest },
  ref,
) {
  const [text, setText] = useControllableState(value, defaultValue, onChange);
  const [composing, setComposing] = useState(false);
  const submit = () => {
    const prompt = text.trim();
    if (!prompt || generating || disabled) return;
    onSubmit?.(prompt);
    if (clearOnSubmit) setText('');
  };
  const handleKey = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || composing) return;
    if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); submit(); }
  };
  return (
    <div className={cx(styles.root, className)}>
      {suggestions.length > 0 && (
        <ul className={styles.suggestions} aria-label={labels.suggestions}>
          {suggestions.map((s) => <li key={s}><button type="button" className={styles.chip} disabled={disabled} onClick={() => setText(s)}>{s}</button></li>)}
        </ul>
      )}
      <div className={styles.field}>
        <TextArea
          ref={ref}
          autoResize
          maxRows={8}
          value={text}
          disabled={disabled}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          onCompositionStart={() => setComposing(true)}
          onCompositionEnd={() => setComposing(false)}
          {...rest}
        />
        <div className={styles.action}>
          {generating
            ? <IconButton icon={<Square />} label={labels.stop} onClick={onStop} />
            : <IconButton icon={<Send />} label={labels.send} variant="primary" disabled={disabled || !text.trim()} onClick={submit} />}
        </div>
      </div>
      {footnote && <p className={styles.footnote}>{footnote}</p>}
    </div>
  );
});
