import { forwardRef, useEffect, useMemo, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utilities/cx';
import { useId } from '../../hooks/useId';
import { useControllableState } from '../../hooks/useControllableState';
import { Input } from '../input';
import styles from './AddressInput.module.css';

export interface Address {
  /** ISO 3166-1 alpha-2 country code. */
  country: string;
  line1: string;
  line2: string;
  postalCode: string;
  city: string;
  /** State, province or county. */
  region: string;
}

export interface AddressSuggestion {
  /** Text shown in the list. */
  label: string;
  /** Fields filled in when chosen. */
  address: Partial<Address>;
}

type FieldKey = Exclude<keyof Address, 'country'>;

interface CountryFormat {
  /** Field rows in the order the country writes them. */
  rows: FieldKey[][];
  postal?: RegExp;
  postalExample?: string;
  postalLabel?: 'postalCode' | 'zip' | 'postcode';
  regionLabel?: 'state' | 'province' | 'county' | 'region';
  regionRequired?: boolean;
}

const FORMATS: Record<string, CountryFormat> = {
  US: { rows: [['line1'], ['line2'], ['city', 'region', 'postalCode']], postal: /^\d{5}(-\d{4})?$/, postalExample: '94103', postalLabel: 'zip', regionLabel: 'state', regionRequired: true },
  CA: { rows: [['line1'], ['line2'], ['city', 'region', 'postalCode']], postal: /^[A-Z]\d[A-Z] ?\d[A-Z]\d$/i, postalExample: 'K1A 0B1', regionLabel: 'province', regionRequired: true },
  GB: { rows: [['line1'], ['line2'], ['city'], ['region'], ['postalCode']], postal: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i, postalExample: 'SW1A 1AA', postalLabel: 'postcode', regionLabel: 'county' },
  DE: { rows: [['line1'], ['line2'], ['postalCode', 'city']], postal: /^\d{5}$/, postalExample: '20095' },
  FR: { rows: [['line1'], ['line2'], ['postalCode', 'city']], postal: /^\d{5}$/, postalExample: '69001' },
  NL: { rows: [['line1'], ['line2'], ['postalCode', 'city']], postal: /^\d{4} ?[A-Z]{2}$/i, postalExample: '1012 AB' },
  IN: { rows: [['line1'], ['line2'], ['city', 'region'], ['postalCode']], postal: /^\d{6}$/, postalExample: '110001', postalLabel: 'postcode', regionLabel: 'state', regionRequired: true },
  JP: { rows: [['postalCode'], ['region', 'city'], ['line1'], ['line2']], postal: /^\d{3}-?\d{4}$/, postalExample: '100-0001', regionLabel: 'region' },
};
const GENERIC: CountryFormat = { rows: [['line1'], ['line2'], ['postalCode', 'city'], ['region']] };

export interface AddressInputLabels {
  country: string;
  line1: string;
  line2: string;
  city: string;
  postalCode: string;
  zip: string;
  postcode: string;
  state: string;
  province: string;
  county: string;
  region: string;
  optional: string;
  suggestions: (count: number) => string;
  invalidPostal: (example?: string) => string;
}

export interface AddressInputProps extends Omit<HTMLAttributes<HTMLFieldSetElement>, 'onChange' | 'defaultValue'> {
  /** Legend, e.g. "Delivery address". */
  label: ReactNode;
  /** Address. Providing it makes the input controlled. */
  value?: Address;
  /** Initial address when uncontrolled. */
  defaultValue?: Partial<Address>;
  /** Called with the address after every change. */
  onChange?: (address: Address) => void;
  /** Countries to offer as ISO codes. @default ['DE', 'FR', 'GB', 'NL', 'US', 'CA', 'IN', 'JP'] */
  countries?: string[];
  /** Address lookup service; called debounced with the first line. The application owns the provider and its terms. */
  fetchSuggestions?: (text: string, country: string, signal: AbortSignal) => Promise<AddressSuggestion[]>;
  /** Required address (line 1, city, postal code and, where used, region). @default false */
  required?: boolean;
  /** Errors per field, e.g. from the server. @default {} */
  errors?: Partial<Record<keyof Address, string>>;
  /** Disables the fields. @default false */
  disabled?: boolean;
  /** Locale for country names. */
  locale?: string;
  /** `autocomplete` section, e.g. `shipping` or `billing`. */
  autoCompleteSection?: 'shipping' | 'billing';
  /** Overrides for the built-in strings. */
  labels?: Partial<AddressInputLabels>;
}

const defaultLabels: AddressInputLabels = {
  country: 'Country or region',
  line1: 'Street and house number',
  line2: 'Apartment, suite, building',
  city: 'City',
  postalCode: 'Postal code',
  zip: 'ZIP code',
  postcode: 'Postcode',
  state: 'State',
  province: 'Province',
  county: 'County',
  region: 'Region',
  optional: 'optional',
  suggestions: (n) => `${n} address ${n === 1 ? 'suggestion' : 'suggestions'}`,
  invalidPostal: (example) => (example ? `Enter a valid postal code, for example ${example}.` : 'Enter a valid postal code.'),
};

const AUTOCOMPLETE: Record<FieldKey, string> = { line1: 'address-line1', line2: 'address-line2', city: 'address-level2', region: 'address-level1', postalCode: 'postal-code' };
const EMPTY: Address = { country: 'DE', line1: '', line2: '', postalCode: '', city: '', region: '' };

/** Format and postal-code rule for a country (exported for server-side reuse and tests). */
export const addressFormat = (country: string): CountryFormat => FORMATS[country] ?? GENERIC;

/**
 * A postal address whose fields, order, labels and postal-code check follow the selected country,
 * with browser autofill tokens and optional lookup suggestions.
 */
export const AddressInput = forwardRef<HTMLFieldSetElement, AddressInputProps>(function AddressInput(
  { label, value, defaultValue, onChange, countries = ['DE', 'FR', 'GB', 'NL', 'US', 'CA', 'IN', 'JP'], fetchSuggestions, required = false, errors = {}, disabled = false, locale, autoCompleteSection, labels: labelOverrides, className, ...rest },
  ref,
) {
  const labels = { ...defaultLabels, ...labelOverrides };
  const id = useId(undefined, 'address');
  const [address, setAddress] = useControllableState<Address>(value, { ...EMPTY, ...defaultValue }, onChange);
  const [postalError, setPostalError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const lastTyped = useRef('');
  const format = addressFormat(address.country);
  const names = useMemo(() => {
    try {
      const dn = new Intl.DisplayNames(locale ? [locale] : undefined, { type: 'region' });
      return Object.fromEntries(countries.map((c) => [c, dn.of(c) ?? c]));
    } catch {
      return Object.fromEntries(countries.map((c) => [c, c]));
    }
  }, [countries, locale]);
  const sortedCountries = [...countries].sort((a, b) => names[a].localeCompare(names[b], locale));

  const update = (patch: Partial<Address>) => setAddress({ ...address, ...patch });

  useEffect(() => {
    if (!fetchSuggestions) return;
    const text = address.line1.trim();
    if (text.length < 3 || text !== lastTyped.current) {
      setSuggestions([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetchSuggestions(text, address.country, controller.signal)
        .then((list) => !controller.signal.aborted && setSuggestions(list.slice(0, 5)))
        .catch(() => !controller.signal.aborted && setSuggestions([]));
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
    // fetchSuggestions is usually inline; the typed text drives it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address.line1, address.country]);

  const labelFor = (key: FieldKey) => {
    if (key === 'postalCode') return labels[format.postalLabel ?? 'postalCode'];
    if (key === 'region') return labels[format.regionLabel ?? 'region'];
    return labels[key];
  };
  const isRequired = (key: FieldKey) => required && (key === 'line1' || key === 'city' || key === 'postalCode' || (key === 'region' && !!format.regionRequired));
  const ac = (key: FieldKey | 'country') => [autoCompleteSection, key === 'country' ? 'country' : AUTOCOMPLETE[key]].filter(Boolean).join(' ');

  const checkPostal = (code: string) => {
    setPostalError(code && format.postal && !format.postal.test(code.trim()) ? labels.invalidPostal(format.postalExample) : null);
  };

  return (
    <fieldset ref={ref} className={cx(styles.root, className)} disabled={disabled} {...rest}>
      <legend className={styles.legend}>{label}</legend>
      <label className={styles.countryField}>
        <span className={styles.label}>{labels.country}</span>
        <select
          className={styles.select}
          value={address.country}
          autoComplete={ac('country')}
          onChange={(e) => {
            update({ country: e.target.value, region: '' });
            setPostalError(null);
          }}
        >
          {sortedCountries.map((c) => (
            <option key={c} value={c}>
              {names[c]}
            </option>
          ))}
        </select>
      </label>
      {format.rows.map((row, r) => (
        <div key={`${address.country}-${r}`} className={styles.row}>
          {row.map((key) => (
            <div key={key} className={cx(styles.cell, key === 'postalCode' && styles.short)}>
              <Input
                label={key === 'line2' && !isRequired(key) ? `${labelFor(key)} (${labels.optional})` : labelFor(key)}
                value={address[key]}
                required={isRequired(key)}
                autoComplete={ac(key)}
                error={key === 'postalCode' ? postalError ?? errors.postalCode : errors[key]}
                aria-autocomplete={key === 'line1' && fetchSuggestions ? 'list' : undefined}
                aria-controls={key === 'line1' && suggestions.length ? `${id}-suggestions` : undefined}
                onChange={(e) => {
                  if (key === 'line1') lastTyped.current = e.target.value.trim();
                  update({ [key]: e.target.value });
                }}
                onBlur={key === 'postalCode' ? (e) => checkPostal(e.target.value) : undefined}
              />
              {key === 'line1' && suggestions.length > 0 && (
                <ul id={`${id}-suggestions`} className={styles.suggestions} aria-label={labels.suggestions(suggestions.length)}>
                  {suggestions.map((s) => (
                    <li key={s.label}>
                      <button
                        type="button"
                        className={styles.suggestion}
                        onClick={() => {
                          lastTyped.current = '';
                          setSuggestions([]);
                          update(s.address);
                          setPostalError(null);
                        }}
                      >
                        {s.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      ))}
      <span className="eui-visually-hidden" aria-live="polite">
        {suggestions.length ? labels.suggestions(suggestions.length) : ''}
      </span>
    </fieldset>
  );
});
