import type { ReactNode } from 'react';

/** An option for Select, ComboBox and MultiSelect. */
export interface SelectOption<V extends string = string> {
  value: V;
  label: string;
  description?: string;
  icon?: ReactNode;
  disabled?: boolean;
  /** Options with the same group are rendered under a group heading. */
  group?: string;
}
