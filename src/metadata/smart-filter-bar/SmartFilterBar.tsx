import { forwardRef } from 'react';
import { DateRangePicker } from '../../components/date-range-picker';
import { Input } from '../../components/input';
import { MultiSelect } from '../../components/multi-select';
import { NumberInput } from '../../components/number-input';
import { SearchField } from '../../components/search-field';
import { Select } from '../../components/select';
import { FilterBar, type FilterBarProps } from '../../patterns/filter-bar';
import { useControllableState } from '../../hooks/useControllableState';
import { useMetadata, type MetadataContextValue } from '../MetadataProvider';
import { countActiveFilters, type DateRangeFilter, type FilterCondition, type FilterValues, type NumberRangeFilter } from '../engine/filter';
import { resolveFields, type EntitySchema, type FieldDefinition } from '../engine/schema';
import styles from './SmartFilterBar.module.css';

export interface SmartFilterBarProps extends Omit<FilterBarProps, 'children' | 'onGo' | 'onClear' | 'activeCount' | 'search' | 'onChange' | 'defaultValue'> {
  /** Metadata of the entity being filtered. */
  schema: EntitySchema;
  /** Fields to offer as filters, in order. Defaults to every visible field that is not `filterable: false`. */
  fields?: readonly string[];
  /** Controlled filter conditions by field name. */
  value?: FilterValues;
  /** Initial filter conditions when uncontrolled. @default {} */
  defaultValue?: FilterValues;
  /** Called with the conditions after every change. In `liveMode`, apply them here. */
  onChange?: (filters: FilterValues) => void;
  /** Called with the conditions and search text when the user presses Go (or Enter). */
  onGo?: (filters: FilterValues, search: string) => void;
  /** Called after Clear empties the conditions and the search. */
  onClear?: () => void;
  /** Show a free-text search field. @default true */
  searchable?: boolean;
  /** Controlled search text. */
  search?: string;
  /** Initial search text when uncontrolled. @default '' */
  defaultSearch?: string;
  /** Called with the search text after every change. */
  onSearchChange?: (search: string) => void;
  /** Control size. @default 'sm' */
  size?: 'sm' | 'md' | 'lg';
}

interface FilterControlProps {
  field: FieldDefinition;
  value: FilterCondition | undefined;
  onChange: (value: FilterCondition) => void;
  size: 'sm' | 'md' | 'lg';
  context: MetadataContextValue;
}

const ANY = '__any';

/** The filter control for a field type: text contains, any-of lists, Yes/No/Any, number ranges and date ranges. */
function FilterControl({ field, value, onChange, size, context }: FilterControlProps) {
  const { messages, locale } = context;
  switch (field.type) {
    case 'boolean':
      return (
        <Select
          label={field.label}
          size={size}
          options={[
            { value: ANY, label: messages.any },
            { value: 'true', label: field.format?.trueLabel ?? messages.yes },
            { value: 'false', label: field.format?.falseLabel ?? messages.no },
          ]}
          value={value === true ? 'true' : value === false ? 'false' : ANY}
          onChange={(v) => onChange(v === 'true' ? true : v === 'false' ? false : null)}
        />
      );
    case 'enum':
    case 'multi':
      if (field.options?.length) {
        return <MultiSelect label={field.label} size={size} placeholder={messages.any} options={[...field.options]} value={Array.isArray(value) ? value : []} onChange={onChange} />;
      }
      return <Input label={field.label} size={size} value={typeof value === 'string' ? value : ''} onChange={(e) => onChange(e.target.value)} />;
    case 'number':
    case 'currency': {
      const range = (value as NumberRangeFilter | undefined) ?? { from: null, to: null };
      const unit = field.type === 'number' ? field.format?.unit : field.currency;
      return (
        <fieldset className={styles.range}>
          <legend className={styles.legend}>{field.label}</legend>
          <div className={styles.rangeInputs}>
            <NumberInput label={`${field.label} ${messages.from}`} hideLabel placeholder={messages.from} size={size} showStepper={false} locale={locale} unit={unit} value={range.from} onChange={(from) => onChange({ ...range, from })} />
            <NumberInput label={`${field.label} ${messages.to}`} hideLabel placeholder={messages.to} size={size} showStepper={false} locale={locale} unit={unit} value={range.to} onChange={(to) => onChange({ ...range, to })} />
          </div>
        </fieldset>
      );
    }
    case 'date':
    case 'datetime':
      return <DateRangePicker label={field.label} value={(value as DateRangeFilter | undefined) ?? { start: '', end: '' }} onChange={onChange} />;
    default:
      return <Input label={field.label} size={size} placeholder={field.placeholder} value={typeof value === 'string' ? value : ''} onChange={(e) => onChange(e.target.value)} />;
  }
}

/**
 * A FilterBar generated from a schema: one filter per field with the right
 * condition control for its type, a free-text search, an active-filter count
 * and Go / Clear. Pair it with `filterRecords` or send the conditions to your backend.
 */
export const SmartFilterBar = forwardRef<HTMLFormElement, SmartFilterBarProps>(function SmartFilterBar(
  { schema, fields, value, defaultValue = {}, onChange, onGo, onClear, searchable = true, search, defaultSearch = '', onSearchChange, size = 'sm', liveMode, ...rest },
  ref,
) {
  const context = useMetadata();
  const [filters, setFilters] = useControllableState<FilterValues>(value, defaultValue, onChange);
  const [text, setText] = useControllableState<string>(search, defaultSearch, onSearchChange);
  const defs = resolveFields(schema, fields, (f) => f.filterable !== false);
  const activeCount = countActiveFilters(filters) + (text.trim() ? 1 : 0);

  return (
    <FilterBar
      ref={ref}
      {...rest}
      liveMode={liveMode}
      activeCount={activeCount}
      onGo={() => onGo?.(filters, text)}
      onClear={() => {
        setFilters({});
        setText('');
        onClear?.();
      }}
      search={searchable ? <SearchField aria-label={schema.label ? `${context.messages.search} ${schema.label}` : context.messages.search} size={size} value={text} onChange={setText} onSearch={(s) => onGo?.(filters, s)} /> : undefined}
    >
      {defs.map((field) => (
        <FilterControl key={field.name} field={field} value={filters[field.name]} size={size} context={context} onChange={(condition) => setFilters((prev) => ({ ...prev, [field.name]: condition }))} />
      ))}
    </FilterBar>
  );
});
