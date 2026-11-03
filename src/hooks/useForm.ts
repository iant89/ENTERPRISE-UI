import { useCallback, useMemo, useRef, useState, type FormEvent } from 'react';
import { useId } from './useId';

/** A validation rule: returns a message for invalid input, or nothing. May be async (e.g. a server check). */
export type FormRule<V, T> = (value: V, values: T) => string | null | undefined | false | Promise<string | null | undefined | false>;

export type FormErrors<T> = Partial<Record<keyof T, string>>;

export interface UseFormOptions<T extends Record<string, unknown>> {
  /** Starting values; also what `reset()` and dirty tracking compare against. */
  initialValues: T;
  /** Rules per field, run in order; the first message wins. */
  rules?: { [K in keyof T]?: FormRule<T[K], T> | FormRule<T[K], T>[] };
  /** Cross-field validation (e.g. end date after start date). Runs after the field rules. */
  validate?: (values: T) => FormErrors<T>;
  /** Field names shown in the error summary. Defaults to the field key. */
  fieldLabels?: Partial<Record<keyof T, string>>;
  /** Fields that are required (adds `required` to `field()` props). */
  required?: (keyof T)[];
  /** Called with valid values. Return field errors (e.g. from the server) to show them on the fields. */
  onSubmit?: (values: T) => void | FormErrors<T> | Promise<void | FormErrors<T>>;
  /** When to validate a field: after leaving it (then on every change once it has an error), or on every change. @default 'blur' */
  mode?: 'blur' | 'change';
}

export interface FormErrorItem {
  name: string;
  /** Id of the field's control; link to `#id` to move focus there. */
  id: string;
  label: string;
  message: string;
}

/** Props to spread on a library form control. `onChange` accepts a value or a change event. */
export interface FormFieldBinding<V> {
  id: string;
  name: string;
  value: V;
  onChange: (valueOrEvent: unknown) => void;
  onBlur: () => void;
  error: string | undefined;
  required: boolean | undefined;
}

export interface UseFormResult<T extends Record<string, unknown>> {
  values: T;
  errors: FormErrors<T>;
  touched: Partial<Record<keyof T, boolean>>;
  /** Some value differs from `initialValues`. */
  dirty: boolean;
  /** Keys of the values that differ from `initialValues`. */
  dirtyFields: (keyof T)[];
  isSubmitting: boolean;
  /** Increases on every submit attempt; use it to move focus to the error summary. */
  submitCount: number;
  /** Errors in field order, ready for FormErrorSummary or MessagePopover. */
  errorList: FormErrorItem[];
  setValue: <K extends keyof T>(name: K, value: T[K]) => void;
  setValues: (values: Partial<T>) => void;
  setError: (name: keyof T, message: string | undefined) => void;
  /** Replaces all errors, e.g. with server-side validation results. */
  setErrors: (errors: FormErrors<T>) => void;
  /** Restores `initialValues` (or new values, which become the new baseline). */
  reset: (values?: T) => void;
  validateField: (name: keyof T) => Promise<string | undefined>;
  /** Validates every field; resolves to `true` when the form is valid. */
  validateAll: () => Promise<boolean>;
  /** Wires a control to the form: id, name, value, onChange, onBlur, error and required. */
  field: <K extends keyof T>(name: K) => FormFieldBinding<T[K]>;
  /** Form `onSubmit` handler: touches and validates every field, then calls `onSubmit` with valid values. */
  handleSubmit: (event?: FormEvent) => Promise<void>;
  /** Id prefix of the generated control ids. */
  formId: string;
}

const isEvent = (v: unknown): v is { target: { value?: unknown; checked?: unknown; type?: string } } =>
  !!v && typeof v === 'object' && 'target' in (v as object) && !!(v as { target: unknown }).target;

function readValue(input: unknown): unknown {
  if (!isEvent(input)) return input;
  const { target } = input;
  if (target.type === 'checkbox') return target.checked;
  return target.value;
}

const same = (a: unknown, b: unknown) => (Array.isArray(a) || (a && typeof a === 'object') ? JSON.stringify(a) === JSON.stringify(b) : Object.is(a, b));

/**
 * Form state without a dependency: values, sync and async validation, touched and dirty tracking,
 * server errors and an ordered error list for an accessible error summary.
 */
export function useForm<T extends Record<string, unknown>>(options: UseFormOptions<T>): UseFormResult<T> {
  const { rules = {} as NonNullable<UseFormOptions<T>['rules']>, validate, fieldLabels = {} as Partial<Record<keyof T, string>>, required = [], onSubmit, mode = 'blur' } = options;
  const formId = useId(undefined, 'form');
  const [initial, setInitial] = useState<T>(options.initialValues);
  const [values, setValuesState] = useState<T>(options.initialValues);
  const [errors, setErrorsState] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  const valuesRef = useRef(values);
  valuesRef.current = values;
  const errorsRef = useRef(errors);
  errorsRef.current = errors;
  // Each validation run gets a token, so a slow async check never overwrites a newer result.
  const tokens = useRef(new Map<keyof T, number>());
  const optionsRef = useRef({ rules, validate });
  optionsRef.current = { rules, validate };

  const runRules = useCallback(async (name: keyof T, all: T): Promise<string | undefined> => {
    const list = optionsRef.current.rules[name];
    for (const rule of Array.isArray(list) ? list : list ? [list] : []) {
      const message = await rule(all[name] as never, all);
      if (message) return message;
    }
    return optionsRef.current.validate?.(all)[name];
  }, []);

  const setError = useCallback((name: keyof T, message: string | undefined) => {
    setErrorsState((prev) => {
      if (prev[name] === message) return prev;
      const next = { ...prev };
      if (message) next[name] = message;
      else delete next[name];
      return next;
    });
  }, []);

  const validateField = useCallback(
    async (name: keyof T) => {
      const token = (tokens.current.get(name) ?? 0) + 1;
      tokens.current.set(name, token);
      const message = await runRules(name, valuesRef.current);
      if (tokens.current.get(name) === token) setError(name, message);
      return message;
    },
    [runRules, setError],
  );

  const fieldNames = useCallback(() => {
    const names = new Set<keyof T>([...Object.keys(initial), ...Object.keys(optionsRef.current.rules)] as (keyof T)[]);
    return [...names];
  }, [initial]);

  const validateAll = useCallback(async () => {
    const names = fieldNames();
    const results = await Promise.all(names.map(async (n) => [n, await runRules(n, valuesRef.current)] as const));
    const next: FormErrors<T> = {};
    for (const [n, m] of results) if (m) next[n] = m;
    setErrorsState(next);
    return Object.keys(next).length === 0;
  }, [fieldNames, runRules]);

  const setValue = useCallback(
    <K extends keyof T>(name: K, value: T[K]) => {
      const next = { ...valuesRef.current, [name]: value };
      valuesRef.current = next;
      setValuesState(next);
      // Re-validate while the user fixes an error, or always in 'change' mode.
      if (mode === 'change' || errorsRef.current[name]) void validateField(name);
    },
    [mode, validateField],
  );

  const setValues = useCallback((partial: Partial<T>) => {
    const next = { ...valuesRef.current, ...partial };
    valuesRef.current = next;
    setValuesState(next);
  }, []);

  const reset = useCallback((nextValues?: T) => {
    const base = nextValues ?? initial;
    if (nextValues) setInitial(nextValues);
    valuesRef.current = base;
    setValuesState(base);
    setErrorsState({});
    setTouched({});
  }, [initial]);

  const field = useCallback(
    <K extends keyof T>(name: K): FormFieldBinding<T[K]> => ({
      id: `${formId}-${String(name)}`,
      name: String(name),
      value: values[name],
      onChange: (input: unknown) => setValue(name, readValue(input) as T[K]),
      onBlur: () => {
        setTouched((t) => (t[name] ? t : { ...t, [name]: true }));
        void validateField(name);
      },
      error: touched[name] || submitCount > 0 ? errors[name] : undefined,
      required: required.includes(name) || undefined,
    }),
    [formId, values, errors, touched, submitCount, required, setValue, validateField],
  );

  const handleSubmit = useCallback(
    async (event?: FormEvent) => {
      event?.preventDefault();
      setTouched(Object.fromEntries(fieldNames().map((n) => [n, true])) as Partial<Record<keyof T, boolean>>);
      const valid = await validateAll();
      // Counted after validation so the count and the errors change together (FormErrorSummary focuses on it).
      setSubmitCount((c) => c + 1);
      if (!valid || !onSubmit) return;
      setSubmitting(true);
      try {
        const serverErrors = await onSubmit(valuesRef.current);
        if (serverErrors && Object.keys(serverErrors).length) setErrorsState(serverErrors);
      } finally {
        setSubmitting(false);
      }
    },
    [fieldNames, validateAll, onSubmit],
  );

  const dirtyFields = useMemo(() => (Object.keys(values) as (keyof T)[]).filter((k) => !same(values[k], initial[k])), [values, initial]);

  const errorList = useMemo<FormErrorItem[]>(
    () =>
      fieldNames()
        .filter((n) => errors[n])
        .map((n) => ({ name: String(n), id: `${formId}-${String(n)}`, label: fieldLabels[n] ?? String(n), message: errors[n]! })),
    // fieldLabels is usually an inline object; its content, not identity, matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [errors, formId, fieldNames, JSON.stringify(fieldLabels)],
  );

  return {
    values, errors, touched, dirty: dirtyFields.length > 0, dirtyFields, isSubmitting, submitCount, errorList,
    setValue, setValues, setError, setErrors: setErrorsState, reset, validateField, validateAll, field, handleSubmit, formId,
  };
}

/** Common rules. Every message can be replaced for localization. */
export const validators = {
  required:
    (message = 'Enter a value.') =>
    (value: unknown) =>
      value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0) || value === false ? message : undefined,
  minLength:
    (min: number, message = `Enter at least ${min} characters.`) =>
    (value: unknown) =>
      typeof value === 'string' && value.length > 0 && value.length < min ? message : undefined,
  maxLength:
    (max: number, message = `Enter at most ${max} characters.`) =>
    (value: unknown) =>
      typeof value === 'string' && value.length > max ? message : undefined,
  pattern:
    (regex: RegExp, message = 'Enter a value in the correct format.') =>
    (value: unknown) =>
      typeof value === 'string' && value !== '' && !regex.test(value) ? message : undefined,
  email: (message = 'Enter an email address like name@example.com.') => (value: unknown) =>
    typeof value === 'string' && value !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? message : undefined,
  min:
    (min: number, message = `Enter ${min} or more.`) =>
    (value: unknown) =>
      typeof value === 'number' && value < min ? message : undefined,
  max:
    (max: number, message = `Enter ${max} or less.`) =>
    (value: unknown) =>
      typeof value === 'number' && value > max ? message : undefined,
};
