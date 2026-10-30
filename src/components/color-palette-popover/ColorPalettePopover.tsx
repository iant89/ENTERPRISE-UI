import type { ReactElement } from 'react';
import { useControllableState } from '../../hooks/useControllableState';
import { Popover } from '../popover';
import { ColorPalette, type ColorOption } from '../color-palette';

export interface ColorPalettePopoverProps {
  /** Trigger must accept a ref and click handler. */
  trigger: ReactElement;
  /** Unique color options. */
  colors: ColorOption[];
  /** Accessible name for both the popover and palette. */
  'aria-label': string;
  /** The current value. Providing it makes the component controlled; update it from the change callback. */
  value?: string | null;
  /** The initial value when the component is uncontrolled. */
  defaultValue?: string | null;
  /** Called with the color the user selects. */
  onChange?: (color: string) => void;
  /** Whether it is open. Providing it makes the open state controlled. */
  open?: boolean;
  /** Whether it is open initially when the open state is uncontrolled. */
  defaultOpen?: boolean;
  /** Called with the new open state when the user opens or closes it. */
  onOpenChange?: (open: boolean) => void;
}
/** A color palette in an accessible non-modal popover. */
export function ColorPalettePopover({ trigger, colors, 'aria-label': label, value, defaultValue = null, onChange, open, defaultOpen, onOpenChange }: ColorPalettePopoverProps) {
  const [selected, setSelected] = useControllableState<string | null>(value, defaultValue, (next) => { if (next !== null) onChange?.(next); });
  return <Popover trigger={trigger} aria-label={label} open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
    {(close) => <ColorPalette aria-label={label} colors={colors} value={selected} onChange={(color) => { setSelected(color); close(); }} />}
  </Popover>;
}
