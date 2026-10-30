import { forwardRef, type ChangeEvent } from 'react';
import { Input, type InputProps } from '../input';

export interface DateTimePickerProps extends Omit<InputProps, 'type' | 'onChange' | 'value' | 'defaultValue'> {
  /** Local date and time, e.g. `2026-10-30T09:30`; no timezone is implied. */
  value?: string;
  defaultValue?: string;
  /** Called with the browser's local date-time value or an empty string. */
  onChange?: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
}
/** A labelled native date and time input; locale and picker UI are browser provided. */
export const DateTimePicker = forwardRef<HTMLInputElement, DateTimePickerProps>(function DateTimePicker({ onChange, ...rest }, ref) {
  return <Input {...rest} ref={ref} type="datetime-local" onChange={(event) => onChange?.(event.currentTarget.value, event)} />;
});
