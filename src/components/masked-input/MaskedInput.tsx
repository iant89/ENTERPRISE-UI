import { forwardRef, useRef, useState, type ChangeEvent } from 'react';
import { useControllableState } from '../../hooks/useControllableState';
import { useMergedRefs } from '../../utilities/refs';
import { Input, type InputProps } from '../input';

export interface MaskedInputProps extends Omit<InputProps, 'value' | 'defaultValue' | 'onChange' | 'maxLength'> {
  /**
   * Format pattern: `9` a digit, `A` a letter, `*` a letter or digit; any other character is a
   * fixed separator inserted while typing. Example: `AA99 9999 9999 9999 9999 99` for a German IBAN.
   */
  mask: string;
  /** Raw value without separators. Providing it makes the input controlled. */
  value?: string;
  /** Initial raw value when uncontrolled. @default '' */
  defaultValue?: string;
  /** Called with the raw value, the formatted text and whether every slot is filled. */
  onChange?: (raw: string, info: { formatted: string; complete: boolean }) => void;
  /** Letter case applied to typed letters. @default 'upper' */
  letterCase?: 'upper' | 'lower' | 'none';
}

const SLOT: Record<string, RegExp> = { '9': /\d/, A: /[a-z]/i, '*': /[a-z\d]/i };

/** Keeps only characters that fit the mask's slots, in order. */
function extractRaw(text: string, mask: string, letterCase: 'upper' | 'lower' | 'none'): string {
  const slots = [...mask].filter((c) => SLOT[c]);
  let raw = '';
  for (const ch of text) {
    const slot = slots[raw.length];
    if (!slot) break;
    if (SLOT[slot].test(ch)) raw += letterCase === 'upper' ? ch.toUpperCase() : letterCase === 'lower' ? ch.toLowerCase() : ch;
  }
  return raw;
}

/** Places raw characters into the mask, adding separators up to the last typed character. */
export function applyMask(raw: string, mask: string): string {
  let out = '';
  let i = 0;
  for (const m of mask) {
    if (i >= raw.length) break;
    if (SLOT[m]) out += raw[i++];
    else out += m;
  }
  return out;
}

/**
 * Text entry in a fixed format (IBAN, phone, postcode, tax ID). Separators are inserted while
 * typing, pasted text with or without separators is accepted, and the raw value is reported.
 */
export const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(function MaskedInput(
  { mask, value, defaultValue = '', onChange, letterCase = 'upper', placeholder, ...rest },
  ref,
) {
  const inputRef = useRef<HTMLInputElement>(null);
  const merged = useMergedRefs(ref, inputRef);
  const slotCount = [...mask].filter((c) => SLOT[c]).length;
  const [raw, setRaw] = useControllableState(value, defaultValue);
  const [, force] = useState(0);
  const formatted = applyMask(raw, mask);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const el = event.target;
    const caret = el.selectionStart ?? el.value.length;
    // Count slot characters before the caret so the caret stays after the same character.
    const rawBeforeCaret = extractRaw(el.value.slice(0, caret), mask, letterCase).length;
    const next = extractRaw(el.value, mask, letterCase);
    setRaw(next);
    force((n) => n + 1);
    onChange?.(next, { formatted: applyMask(next, mask), complete: next.length === slotCount });
    requestAnimationFrame(() => {
      const input = inputRef.current;
      if (!input || document.activeElement !== input) return;
      const text = applyMask(next, mask);
      let pos = 0;
      let seen = 0;
      while (pos < text.length && seen < rawBeforeCaret) {
        if (SLOT[mask[pos]]) seen++;
        pos++;
      }
      // Skip a separator that directly follows, so typing continues after it.
      while (pos < text.length && !SLOT[mask[pos]]) pos++;
      input.setSelectionRange(pos, pos);
    });
  };

  return (
    <Input
      ref={merged}
      {...rest}
      value={formatted}
      onChange={handleChange}
      maxLength={mask.length}
      placeholder={placeholder ?? mask.replace(/9/g, '0').replace(/A/g, 'A').replace(/\*/g, '_')}
      autoComplete={rest.autoComplete ?? 'off'}
      spellCheck={false}
    />
  );
});
