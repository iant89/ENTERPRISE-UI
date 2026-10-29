import type { ReactNode } from 'react';
import type { ValidationStatus } from '../../utilities/types';
import { useId } from '../../hooks/useId';
import { FormField, fieldIds, resolveStatus, type FieldProps } from './FormField';
import { useFormFieldContext } from './FormFieldContext';

interface ControlProps extends FieldProps {
  id?: string;
  required?: boolean;
  disabled?: boolean;
  'aria-describedby'?: string;
}

export interface FormControlState {
  id: string;
  status: ValidationStatus;
  required: boolean;
  disabled: boolean;
  /** ARIA attributes for the focusable control. */
  ariaProps: {
    'aria-describedby'?: string;
    'aria-invalid'?: true;
    'aria-required'?: true;
  };
  labelId: string | undefined;
  /** Wraps the control in a FormField when the control received a `label`. */
  wrap: (control: ReactNode) => ReactNode;
}

/**
 * Connects a control to its label, description and validation message —
 * either its own (when `label` is passed) or an enclosing FormField's.
 */
export function useFormControl(props: ControlProps): FormControlState {
  const ctx = useFormFieldContext();
  const own = props.label != null;
  const id = useId(props.id ?? (!own ? ctx?.id : undefined), 'control');

  let status: ValidationStatus;
  let describedBy: string | undefined;
  let required: boolean;
  let disabled: boolean;
  let labelId: string | undefined;

  if (own || !ctx) {
    const resolved = resolveStatus(props.status, props.error, props.statusMessage);
    status = resolved.status;
    const ids = fieldIds(id);
    const hasMessage = resolved.message != null && resolved.message !== false && resolved.message !== '';
    describedBy = [props.description ? ids.descriptionId : null, hasMessage ? ids.messageId : null].filter(Boolean).join(' ') || undefined;
    required = !!props.required;
    disabled = !!props.disabled;
    labelId = own ? ids.labelId : undefined;
  } else {
    const resolved = resolveStatus(props.status ?? ctx.status, props.error, props.statusMessage);
    status = resolved.status;
    describedBy = ctx.describedBy;
    required = props.required ?? ctx.required;
    disabled = props.disabled ?? ctx.disabled;
    labelId = ctx.labelId;
  }

  const allDescribedBy = [describedBy, props['aria-describedby']].filter(Boolean).join(' ') || undefined;

  return {
    id,
    status,
    required,
    disabled,
    labelId,
    ariaProps: {
      'aria-describedby': allDescribedBy,
      'aria-invalid': status === 'error' ? true : undefined,
      'aria-required': required ? true : undefined,
    },
    wrap: (control) =>
      own ? (
        <FormField
          id={id}
          label={props.label}
          description={props.description}
          error={props.error}
          status={props.status}
          statusMessage={props.statusMessage}
          hideLabel={props.hideLabel}
          labelPosition={props.labelPosition}
          required={required}
          disabled={disabled}
        >
          {control}
        </FormField>
      ) : (
        control
      ),
  };
}
