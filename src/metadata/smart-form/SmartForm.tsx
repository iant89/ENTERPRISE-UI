import { forwardRef, useEffect, useMemo, useRef, type CSSProperties, type FormHTMLAttributes, type ReactNode } from 'react';
import { Button } from '../../components/button';
import { FormErrorSummary } from '../../components/form-error-summary';
import { FormGroup } from '../../components/form-group';
import { useForm, type FormErrors, type FormRule, type UseFormResult } from '../../hooks/useForm';
import { cx } from '../../utilities/cx';
import { useMetadata } from '../MetadataProvider';
import { createDefaultValues, currencyOf, resolveFields, type EntitySchema, type FieldDefinition, type FieldType } from '../engine/schema';
import { validateField } from '../engine/validation';
import type { FieldControlRenderer } from '../field-renderer/FieldRenderer';
import { SmartField } from '../smart-field/SmartField';
import styles from './SmartForm.module.css';

type AnyRecord = Record<string, unknown>;

/** Options for {@link useSmartForm}. */
export interface UseSmartFormOptions<T extends AnyRecord> {
  /** Values of an existing record. Missing fields get their schema default. */
  defaultValues?: Partial<T>;
  /** Fields that take part in the form, in order. Defaults to every visible field. */
  fields?: readonly string[];
  /** Called with valid values. Return errors by field name (e.g. from the server) to show them. */
  onSubmit?: (values: T) => void | FormErrors<T> | Promise<void | FormErrors<T>>;
  /** Validate after the user leaves a field, or on every change. @default 'blur' */
  validateOn?: 'blur' | 'change';
}

/**
 * Form state driven by a schema: default values, validation rules,
 * required fields and error-summary labels are all derived from the metadata.
 * Returns a `useForm` result, so it works with custom layouts too.
 */
export function useSmartForm<T extends AnyRecord = AnyRecord>(schema: EntitySchema, options: UseSmartFormOptions<T> = {}): UseFormResult<T> {
  const { locale, messages } = useMetadata();
  const fields = resolveFields(schema, options.fields);
  const editable = fields.filter((f) => !f.readOnly);
  const rules = Object.fromEntries(
    editable.map((f) => [f.name, ((value: unknown, values: T) => validateField(f, value, values, { locale, messages })) as FormRule<unknown, T>]),
  ) as { [K in keyof T]?: FormRule<T[K], T> };
  return useForm<T>({
    initialValues: createDefaultValues<T>(schema, options.defaultValues),
    rules,
    fieldLabels: Object.fromEntries(fields.map((f) => [f.name, f.label])) as Partial<Record<keyof T, string>>,
    required: editable.filter((f) => f.required).map((f) => f.name as keyof T),
    onSubmit: options.onSubmit,
    mode: options.validateOn,
  });
}

/** A titled section of a SmartForm. */
export interface SmartFormGroup {
  /** Section heading. */
  title?: ReactNode;
  /** Text below the heading. */
  description?: ReactNode;
  /** Fields in the section, in order. */
  fields: readonly string[];
  /** Number of columns on wide screens. Defaults to the form's `columns`. */
  columns?: 1 | 2 | 3 | 4;
}

/** Strings of SmartForm. Defaults come from `MetadataProvider`. */
export interface SmartFormLabels {
  /** Submit button. */
  submit: string;
  /** Reset button. */
  reset: string;
}

export interface SmartFormProps<T extends AnyRecord = AnyRecord> extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit' | 'onChange' | 'defaultValue' | 'children'> {
  /** Metadata of the entity being edited. */
  schema: EntitySchema;
  /** Values of an existing record. Remount with a new `key` to load another record. */
  defaultValues?: Partial<T>;
  /** Called with valid values on submit. Return errors by field name to show server-side problems. */
  onSubmit?: (values: T) => void | FormErrors<T> | Promise<void | FormErrors<T>>;
  /** Called with the values after every change. */
  onValuesChange?: (values: T) => void;
  /** Edit with controls, or show formatted values. @default 'edit' */
  mode?: 'edit' | 'display';
  /** Fields to show, in order. Defaults to every visible field. Ignored when `groups` is set. */
  fields?: readonly string[];
  /** Sections of fields with headings. */
  groups?: readonly SmartFormGroup[];
  /** Number of field columns on wide screens (collapses responsively). @default 2 */
  columns?: 1 | 2 | 3 | 4;
  /** Validate after the user leaves a field, or on every change. @default 'blur' */
  validateOn?: 'blur' | 'change';
  /** Show the error summary after a failed submit. @default true */
  errorSummary?: boolean;
  /** Show the Reset button. @default true */
  showReset?: boolean;
  /** Hide the built-in actions, e.g. when the page footer submits the form through its `id`. @default false */
  hideActions?: boolean;
  /** Extra actions rendered after the built-in buttons. */
  actions?: ReactNode;
  /** Control size. @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** A form state from {@link useSmartForm}, to read or drive the form from outside. */
  form?: UseFormResult<T>;
  /** Renderers that replace the built-in controls in this form. */
  renderers?: Partial<Record<FieldType, FieldControlRenderer>>;
  /** Overrides for the button texts. */
  labels?: Partial<SmartFormLabels>;
}

function SmartFormInner<T extends AnyRecord = AnyRecord>(
  { schema, defaultValues, onSubmit, onValuesChange, mode = 'edit', fields: fieldNames, groups, columns = 2, validateOn, errorSummary = true, showReset = true, hideActions = false, actions, size, form: externalForm, renderers, labels, className, ...rest }: SmartFormProps<T>,
  ref: React.ForwardedRef<HTMLFormElement>,
) {
  const { messages } = useMetadata();
  const groupFields = groups?.flatMap((g) => g.fields);
  const internalForm = useSmartForm<T>(schema, { defaultValues, fields: groupFields ?? fieldNames, onSubmit, validateOn });
  const form = externalForm ?? internalForm;
  const text = { submit: messages.submit, reset: messages.reset, ...labels };

  const onValuesChangeRef = useRef(onValuesChange);
  onValuesChangeRef.current = onValuesChange;
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    onValuesChangeRef.current?.(form.values);
  }, [form.values]);

  const sections = useMemo(
    () => (groups ?? [{ fields: fieldNames ?? resolveFields(schema).map((f) => f.name) }]).map((g) => ({ ...g, defs: resolveFields(schema, g.fields) })),
    [groups, fieldNames, schema],
  );

  const renderField = (field: FieldDefinition) => {
    const binding = form.field(field.name as keyof T);
    const currencyField = field.type === 'currency' ? field.currencyField : undefined;
    return (
      <SmartField
        key={field.name}
        className={field.type === 'multi' ? styles.wide : undefined}
        field={field}
        mode={mode}
        controlId={binding.id}
        name={binding.name}
        value={binding.value}
        onChange={(value) => form.setValue(field.name as keyof T, value as T[keyof T])}
        onBlur={binding.onBlur}
        error={binding.error}
        validate={false}
        record={form.values}
        currency={field.type === 'currency' ? (currencyOf(field, form.values) ?? undefined) : undefined}
        onCurrencyChange={currencyField ? (code) => form.setValue(currencyField as keyof T, code as T[keyof T]) : undefined}
        size={size}
        renderers={renderers}
      />
    );
  };

  return (
    <form ref={ref} noValidate className={cx(styles.form, className)} onSubmit={mode === 'edit' ? form.handleSubmit : (e) => e.preventDefault()} {...rest}>
      {mode === 'edit' && errorSummary && <FormErrorSummary errors={form.errorList} focusKey={form.submitCount} />}
      {sections.map((section, index) =>
        groups ? (
          <FormGroup key={index} title={section.title} description={section.description} columns={section.columns ?? columns}>
            {section.defs.map(renderField)}
          </FormGroup>
        ) : (
          <div key={index} className={styles.grid} style={{ '--_columns': columns } as CSSProperties}>
            {section.defs.map(renderField)}
          </div>
        ),
      )}
      {mode === 'edit' && !hideActions && (
        <div className={styles.actions}>
          <Button type="submit" variant="primary" size={size} loading={form.isSubmitting}>
            {text.submit}
          </Button>
          {showReset && (
            <Button type="button" variant="secondary" size={size} disabled={!form.dirty} onClick={() => form.reset()}>
              {text.reset}
            </Button>
          )}
          {actions}
        </div>
      )}
    </form>
  );
}

/**
 * A complete create or edit form generated from a schema: one SmartField per
 * field, a responsive grid or titled sections, schema-driven validation with an
 * error summary, and Save / Reset actions. Switch `mode` to `display` for a read-only view.
 */
export const SmartForm = forwardRef(SmartFormInner) as <T extends AnyRecord = AnyRecord>(
  props: SmartFormProps<T> & { ref?: React.Ref<HTMLFormElement> },
) => ReturnType<typeof SmartFormInner>;
