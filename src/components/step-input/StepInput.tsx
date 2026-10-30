import { forwardRef } from 'react';
import { NumberInput, type NumberInputProps } from '../number-input';

export type StepInputProps = NumberInputProps;

/**
 * Numeric entry with decrease and increase buttons.
 * Arrow keys step by `step`, Page Up and Page Down step by ten, and Home and End jump to the bounds.
 */
export const StepInput = forwardRef<HTMLInputElement, StepInputProps>(function StepInput(props, ref) {
  return <NumberInput ref={ref} showStepper {...props} />;
});
