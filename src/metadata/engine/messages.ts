/** Every string the metadata engine and Smart components produce. Override any of them through `MetadataProvider`. */
export interface MetadataMessages {
  /** Error when a required field is empty. */
  required: (label: string) => string;
  /** Error when a number or date is below its minimum. */
  min: (label: string, limit: string) => string;
  /** Error when a number or date is above its maximum. */
  max: (label: string, limit: string) => string;
  /** Error when text (`kind: 'text'`) or a list of values (`kind: 'list'`) is too short. */
  minLength: (label: string, limit: number, kind: 'text' | 'list') => string;
  /** Error when text (`kind: 'text'`) or a list of values (`kind: 'list'`) is too long. */
  maxLength: (label: string, limit: number, kind: 'text' | 'list') => string;
  /** Error when text does not match its pattern. */
  pattern: (label: string) => string;
  /** Error when text is not an email address. */
  email: (label: string) => string;
  /** Display text for `true`. */
  yes: string;
  /** Display text for `false`. */
  no: string;
  /** Display text for empty values. */
  empty: string;
  /** Boolean filter choice that matches every record. */
  any: string;
  /** Accessible name of the lower bound of a range filter. */
  from: string;
  /** Accessible name of the upper bound of a range filter. */
  to: string;
  /** Series name when a chart counts records. */
  count: string;
  /** Default SmartChart name, e.g. "Revenue by Region". */
  chartLabel: (measures: string, dimension: string) => string;
  /** Accessible name of the SmartFilterBar search field. */
  search: string;
  /** SmartForm submit button. */
  submit: string;
  /** SmartForm reset button. */
  reset: string;
}

const unit = (n: number, kind: 'text' | 'list') => (kind === 'list' ? (n === 1 ? 'value' : 'values') : n === 1 ? 'character' : 'characters');

/** English defaults for {@link MetadataMessages}. */
export const defaultMessages: MetadataMessages = {
  required: (label) => `Enter ${label}.`,
  min: (label, limit) => `${label} must be ${limit} or more.`,
  max: (label, limit) => `${label} must be ${limit} or less.`,
  minLength: (label, limit, kind) => `${label} needs at least ${limit} ${unit(limit, kind)}.`,
  maxLength: (label, limit, kind) => `${label} can have at most ${limit} ${unit(limit, kind)}.`,
  pattern: (label) => `${label} is not in the expected format.`,
  email: (label) => `Enter ${label} as an email address, like name@example.com.`,
  yes: 'Yes',
  no: 'No',
  empty: '—',
  any: 'Any',
  from: 'From',
  to: 'To',
  count: 'Count',
  chartLabel: (measures, dimension) => `${measures} by ${dimension}`,
  search: 'Search',
  submit: 'Save',
  reset: 'Reset',
};
