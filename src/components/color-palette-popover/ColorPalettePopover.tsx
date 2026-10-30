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
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (color: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}
/** A color palette in an accessible non-modal popover. */
export function ColorPalettePopover({ trigger, colors, 'aria-label': label, value, defaultValue = null, onChange, open, defaultOpen, onOpenChange }: ColorPalettePopoverProps) {
  const [selected, setSelected] = useControllableState<string | null>(value, defaultValue, (next) => { if (next !== null) onChange?.(next); });
  return <Popover trigger={trigger} aria-label={label} open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
    {(close) => <ColorPalette aria-label={label} colors={colors} value={selected} onChange={(color) => { setSelected(color); close(); }} />}
  </Popover>;
}
