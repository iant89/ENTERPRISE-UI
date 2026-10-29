import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { cx } from '../../utilities/cx';
import type { ValidationStatus } from '../../utilities/types';
import { useId } from '../../hooks/useId';
import { FormFieldContext, type FormFieldContextValue } from './FormFieldContext';
import styles from './FormField.module.css';

/** Props shared by every form control for labelling and validation. */
export interface FieldProps {
  /** Visible label. When set, the control renders its own FormField wrapper. */
  label?: ReactNode;
  /** Helper text shown below the control. */
  description?: ReactNode;
  /** Error message. Sets `status="error"` and `aria-invalid`. */
  error?: ReactNode;
  /** Validation state (Fiori "value state"). @default 'none' */
  status?: ValidationStatus;
  /** Message for non-error statuses (warning, success, information). */
  statusMessage?: ReactNode;
  /** Visually hide the label (it stays available to screen readers). @default false */
  hideLabel?: boolean;
  /** Place the label beside the control on wide screens. @default 'vertical' */
  labelPosition?: 'vertical' | 'horizontal';
}

export interface FormFieldProps extends FieldProps, Omit<HTMLAttributes<HTMLDivElement>, 'id'> {
  /** Id of the control. Generated when omitted. */
  id?: string;
  /** Marks the field as required (asterisk + `aria-required`). @default false */
  required?: boolean;
  /** @default false */
  disabled?: boolean;
  children: ReactNode;
}

const STATUS_ICON = { error: XCircle, warning: AlertTriangle, success: CheckCircle2, information: Info } as const;

/** Resolves the effective status and message from {@link FieldProps}. */
export function resolveStatus(status: ValidationStatus | undefined, error: ReactNode, statusMessage: ReactNode) {
  if (error != null && error !== false && error !== '') return { status: 'error' as ValidationStatus, message: error };
  return { status: status ?? 'none', message: status && status !== 'none' ? statusMessage : undefined };
}

export const fieldIds = (id: string) => ({
  labelId: `${id}-label`,
  descriptionId: `${id}-description`,
  messageId: `${id}-message`,
});

/**
 * Lays out a label, a control, helper text and a validation message, and
 * wires up `aria-describedby` / `aria-invalid` for the nested control.
 */
export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(function FormField(
  {
    id: providedId,
    label,
    description,
    error,
    status: statusProp,
    statusMessage,
    hideLabel = false,
    labelPosition = 'vertical',
    required = false,
    disabled = false,
    className,
    children,
    ...rest
  },
  ref,
) {
  const id = useId(providedId, 'field');
  const { labelId, descriptionId, messageId } = fieldIds(id);
  const { status, message } = resolveStatus(statusProp, error, statusMessage);
  const hasMessage = message != null && message !== false && message !== '';
  const describedBy = [description ? descriptionId : null, hasMessage ? messageId : null].filter(Boolean).join(' ') || undefined;
  const Icon = status !== 'none' ? STATUS_ICON[status] : null;

  const ctx: FormFieldContextValue = { id, labelId, describedBy, status, required, disabled };

  return (
    <FormFieldContext.Provider value={ctx}>
      <div
        ref={ref}
        className={cx(styles.field, labelPosition === 'horizontal' && styles.horizontal, disabled && styles.disabled, className)}
        {...rest}
      >
        {label != null && (
          <label id={labelId} htmlFor={id} className={cx(styles.label, hideLabel && 'eui-visually-hidden')}>
            {label}
            {required && (
              <span className={styles.required} aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}
        <div className={styles.control}>
          {children}
          {description && (
            <p id={descriptionId} className={styles.description}>
              {description}
            </p>
          )}
          <div id={messageId} className={cx(styles.message, status !== 'none' && styles[status])} aria-live="polite">
            {hasMessage && (
              <>
                {Icon && <Icon aria-hidden="true" />}
                <span>
                  {status === 'error' && <span className="eui-visually-hidden">Error:</span>}
                  {status === 'error' && ' '}
                  {message}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </FormFieldContext.Provider>
  );
});
