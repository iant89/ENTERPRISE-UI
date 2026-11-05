import { forwardRef, useLayoutEffect, useMemo, useRef, useState, type ChangeEvent, type FocusEvent } from 'react';
import { useControllableState } from '../../hooks/useControllableState';
import { useMergedRefs } from '../../utilities/refs';
import { Input, type InputProps } from '../input';

/** Built-in mask characters: `9` a digit, `A` a letter, `*` a letter or digit. */
export const defaultMaskRules: Readonly<Record<string, RegExp>> = { '9': /\d/, A: /[a-z]/i, '*': /[a-z\d]/i };

export interface MaskedInputProps extends Omit<InputProps, 'value' | 'defaultValue' | 'onChange' | 'maxLength'> {
  /**
   * Format pattern. `9` is a digit, `A` a letter, `*` a letter or digit, plus any keys of `rules`.
   * Every other character is fixed and cannot be edited (brackets, dashes, prefixes). Escape a rule
   * character with a backslash to make it fixed, for example `\\A` for a literal "A".
   * Example: `AA99 9999 9999 9999 9999 99` for a German IBAN.
   */
  mask: string;
  /**
   * Raw value: the characters typed into the editable positions, without fixed characters.
   * An empty position before the last filled one is represented by `placeholderSymbol`.
   * Providing it makes the input controlled.
   */
  value?: string;
  /** Initial raw value when uncontrolled. @default '' */
  defaultValue?: string;
  /** Called with the raw value, the formatted text and whether every position is filled. */
  onChange?: (raw: string, info: { formatted: string; complete: boolean }) => void;
  /** Letter case applied to typed letters. @default 'upper' */
  letterCase?: 'upper' | 'lower' | 'none';
  /** Single character shown in empty positions while the mask is visible. @default '_' */
  placeholderSymbol?: string;
  /**
   * Custom rules: mask character → regular expression a typed character must match.
   * They extend (and can override) the built-in `9`, `A` and `*`. Example: `{ x: /[a-e]/ }`.
   */
  rules?: Record<string, RegExp>;
}

/** One position of a parsed mask: a fixed character or an editable position with its rule. */
export type MaskToken = { literal: string } | { rule: RegExp };
type Token = MaskToken;

/** Splits a mask into fixed characters and editable positions. */
export function parseMask(mask: string, rules: Record<string, RegExp> = defaultMaskRules): MaskToken[] {
  const tokens: Token[] = [];
  for (let i = 0; i < mask.length; i++) {
    const ch = mask[i];
    if (ch === '\\' && i + 1 < mask.length) tokens.push({ literal: mask[++i] });
    else if (Object.prototype.hasOwnProperty.call(rules, ch)) tokens.push({ rule: rules[ch] });
    else tokens.push({ literal: ch });
  }
  return tokens;
}

const isSlot = (t: Token): t is { rule: RegExp } => 'rule' in t;
const test = (rule: RegExp, ch: string) => { rule.lastIndex = 0; return rule.test(ch); };

/** Places raw characters into the mask, adding fixed characters up to the last typed character. */
export function applyMask(raw: string, mask: string, rules: Record<string, RegExp> = defaultMaskRules): string {
  let out = '';
  let i = 0;
  for (const t of parseMask(mask, rules)) {
    if (i >= raw.length) break;
    out += isSlot(t) ? raw[i++] : t.literal;
  }
  return out;
}

/**
 * Text entry in a fixed format (IBAN, phone, product key, tax ID). The mask appears when the field
 * gets focus; typed characters replace the placeholder symbols, invalid characters are rejected,
 * deleting leaves the other characters in place, and pasted text with or without separators is
 * reformatted to the mask.
 */
export const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(function MaskedInput(
  { mask, value, defaultValue = '', onChange, letterCase = 'upper', placeholderSymbol = '_', rules, onFocus, onBlur, ...rest },
  ref,
) {
  const symbol = placeholderSymbol.charAt(0) || '_';
  const inputRef = useRef<HTMLInputElement>(null);
  const merged = useMergedRefs(ref, inputRef);
  const ruleSet = useMemo(() => ({ ...defaultMaskRules, ...rules }), [rules]);
  const tokens = useMemo(() => parseMask(mask, ruleSet), [mask, ruleSet]);
  const slotPositions = useMemo(() => tokens.flatMap((t, i) => (isSlot(t) ? [i] : [])), [tokens]);
  const [raw, setRaw] = useControllableState(value, defaultValue);
  const [focused, setFocused] = useState(false);
  const caret = useRef<number | null>(null);
  // Re-render after every edit, even a rejected one, so the caret is restored after React resets the text.
  const [, setEdits] = useState(0);

  const transform = (ch: string) => (letterCase === 'upper' ? ch.toUpperCase() : letterCase === 'lower' ? ch.toLowerCase() : ch);
  const accepts = (slot: number, ch: string) => test((tokens[slotPositions[slot]] as { rule: RegExp }).rule, ch);

  /** Raw string → one entry per editable position (null when empty). */
  const toSlots = (text: string): (string | null)[] =>
    slotPositions.map((_, i) => {
      const ch = text[i];
      return ch !== undefined && ch !== symbol && accepts(i, ch) ? transform(ch) : null;
    });
  const slots = toSlots(raw);

  const render = (s: (string | null)[], full: boolean) => {
    const last = s.reduce((acc, c, i) => (c !== null ? i : acc), -1);
    let out = '';
    let slot = 0;
    for (const t of tokens) {
      if (isSlot(t)) {
        if (!full && slot > last) break;
        out += s[slot++] ?? symbol;
      } else {
        if (!full && slot > last) break;
        out += t.literal;
      }
    }
    return out;
  };
  /** Raw value: trailing empty positions are dropped, earlier gaps keep the placeholder symbol. */
  const toRaw = (s: (string | null)[]) => {
    const last = s.reduce((acc, c, i) => (c !== null ? i : acc), -1);
    return s.slice(0, last + 1).map((c) => c ?? symbol).join('');
  };

  const hasValue = slots.some((c) => c !== null);
  const display = focused || hasValue ? render(slots, true) : '';

  const firstSlotAtOrAfter = (pos: number) => slotPositions.findIndex((p) => p >= pos);
  const caretAfterSlot = (slot: number) => {
    let pos = slot < 0 ? 0 : slotPositions[slot] + 1;
    while (pos < tokens.length && !isSlot(tokens[pos])) pos++;
    return pos;
  };

  const editCount = useRef(0);
  const commit = (next: (string | null)[], caretPos: number) => {
    editCount.current++;
    const nextRaw = toRaw(next);
    caret.current = caretPos;
    setEdits((n) => n + 1);
    setRaw(nextRaw);
    onChange?.(nextRaw, { formatted: render(next, false), complete: next.every((c) => c !== null) });
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const prev = display || render(slots, true);
    const nextText = event.target.value;
    const inputType = (event.nativeEvent as InputEvent | undefined)?.inputType ?? '';
    // Find the edited range. The caret marks the end of the inserted text, which resolves repeated
    // characters; without a caret, fall back to the common prefix and suffix of the old and new text.
    let start = 0;
    while (start < prev.length && start < nextText.length && prev[start] === nextText[start]) start++;
    const cursor = event.target.selectionStart;
    let endPrev: number;
    let endNext: number;
    if (cursor !== null) {
      start = Math.min(start, cursor);
      endNext = cursor;
      endPrev = Math.max(start, prev.length - (nextText.length - endNext));
    } else {
      endPrev = prev.length;
      endNext = nextText.length;
      while (endPrev > start && endNext > start && prev[endPrev - 1] === nextText[endNext - 1]) { endPrev--; endNext--; }
    }
    let inserted = nextText.slice(start, endNext);
    if (inserted.length > 1 || inputType === 'insertFromPaste') inserted = inserted.trim();
    const next = [...slots];

    // Clear the editable positions in the removed range; fixed characters stay where they are.
    const removedSlots = slotPositions.flatMap((p, i) => (p >= start && p < endPrev ? [i] : []));
    removedSlots.forEach((i) => { next[i] = null; });

    if (!inserted) {
      // Backspace over a fixed character deletes the editable character before it.
      if (removedSlots.length === 0 && endPrev - start === 1 && inputType !== 'deleteContentForward') {
        const before = slotPositions.reduce((acc, p, i) => (p < start ? i : acc), -1);
        if (before >= 0) { next[before] = null; commit(next, slotPositions[before]); return; }
      }
      commit(next, start);
      return;
    }

    // Typed or pasted text fills editable positions from the edit point; invalid characters are skipped.
    let slot = firstSlotAtOrAfter(start);
    if (inserted.length > 1 && removedSlots.length === slotPositions.length) slot = 0;
    // Typing past the last editable position (for example with the caret at the end) fills the first empty one.
    if (slot < 0) slot = next.findIndex((c) => c === null);
    let lastFilled = -1;
    for (const ch of inserted) {
      if (slot < 0 || slot >= slotPositions.length) break;
      if (accepts(slot, ch)) {
        next[slot] = transform(ch);
        lastFilled = slot++;
      } else if (inserted.length === 1) {
        // A single invalid keystroke is rejected; typing the fixed character at the caret just moves past it.
        const literal = tokens[start];
        commit(slots, literal && !isSlot(literal) && literal.literal === ch ? caretAfterSlot(slot - 1) : start);
        return;
      }
    }
    commit(next, lastFilled >= 0 ? caretAfterSlot(lastFilled) : start);
  };

  useLayoutEffect(() => {
    const input = inputRef.current;
    if (caret.current === null || !input || document.activeElement !== input) return;
    const pos = Math.min(caret.current, input.value.length);
    caret.current = null;
    input.setSelectionRange(pos, pos);
  });

  const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
    setFocused(true);
    if (!hasValue) {
      // The mask appears on focus: put the caret at the first editable position. A pointer click
      // places the caret after the focus event, so set it again on the next frame.
      const pos = slotPositions[0] ?? 0;
      caret.current = pos;
      const input = event.currentTarget;
      const editsAtFocus = editCount.current;
      requestAnimationFrame(() => {
        // Skip if the user already typed: the edit has placed the caret.
        if (document.activeElement === input && editCount.current === editsAtFocus) input.setSelectionRange(pos, pos);
      });
    }
    onFocus?.(event);
  };
  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    setFocused(false);
    onBlur?.(event);
  };

  return (
    <Input
      ref={merged}
      {...rest}
      value={display}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      autoComplete={rest.autoComplete ?? 'off'}
      spellCheck={false}
    />
  );
});
