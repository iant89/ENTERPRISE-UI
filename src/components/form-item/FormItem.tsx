import { forwardRef } from 'react';
import { FormField, type FormFieldProps } from '../form-field';
export interface FormItemProps extends FormFieldProps {}
/** A labelled form item. Child Enterprise UI controls receive field context automatically. */
export const FormItem = forwardRef<HTMLDivElement, FormItemProps>(function FormItem(props, ref) {
  return <FormField {...props} ref={ref} />;
});
