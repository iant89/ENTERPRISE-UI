import { createContext, useContext } from 'react';
import type { ValidationStatus } from '../../utilities/types';

export interface FormFieldContextValue {
  id: string;
  labelId: string;
  describedBy: string | undefined;
  status: ValidationStatus;
  required: boolean;
  disabled: boolean;
}

export const FormFieldContext = createContext<FormFieldContextValue | null>(null);

export const useFormFieldContext = () => useContext(FormFieldContext);
