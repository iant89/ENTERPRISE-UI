/** Semantic tone shared by status-bearing components. */
export type Tone = 'neutral' | 'information' | 'success' | 'warning' | 'error';

/** Validation state for form controls (Fiori "value state"). */
export type ValidationStatus = 'none' | 'error' | 'warning' | 'success' | 'information';

/** Common control sizes. */
export type Size = 'sm' | 'md' | 'lg';

/** Floating element placement relative to its anchor. */
export type Placement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';
