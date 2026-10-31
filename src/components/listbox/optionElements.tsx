import { Children, Fragment, isValidElement, type ReactNode } from 'react';
import type { SelectOption } from './types';

interface OptionElementProps {
  label?: string;
  text?: string;
  value?: string;
  additionalText?: string;
  disabled?: boolean;
  children?: ReactNode;
  headerText?: string;
  headerAccessibleName?: string;
}

export interface ComboBoxItemProps {
  /** Visible text. Also used as the value when `value` is omitted. */
  label: string;
  /** Machine-readable value submitted or selected for this item. */
  value?: string;
  /** Secondary text shown beside the label. */
  additionalText?: string;
  /** @default false */
  /** Disables the item. Keyboard navigation skips it. */
  disabled?: boolean;
}
/** A labelled choice for ComboBox. Filtering and selection use the label and value. */
export function ComboBoxItem(_props: ComboBoxItemProps): null {
  return null;
}

export interface ComboBoxItemCustomProps {
  /** Text used for filtering, type-ahead and the accessible name. */
  label: string;
  /** Machine-readable value. @default label */
  value?: string;
  /** Secondary text shown beside the custom content. */
  additionalText?: string;
  /** @default false */
  /** Disables the item. Keyboard navigation skips it. */
  disabled?: boolean;
  /** Visual content. The label remains the accessible name. */
  children?: ReactNode;
}
/** A ComboBox choice with custom content. `label` is used for filtering and the accessible name. */
export function ComboBoxItemCustom(_props: ComboBoxItemCustomProps): null {
  return null;
}

export interface ComboBoxItemGroupProps {
  /** Visible group heading. */
  headerText: string;
  /** Accessible name when it should differ from the visible heading. */
  headerAccessibleName?: string;
  /** Content rendered inside the combo box item group. */
  children?: ReactNode;
}
/** Groups ComboBox items under a heading. The heading is not a selectable choice. */
export function ComboBoxItemGroup(_props: ComboBoxItemGroupProps): null {
  return null;
}

export interface OptionProps {
  /** Visible text. Also used as the value when `value` is omitted. */
  label: string;
  /** Machine-readable value. */
  value?: string;
  /** Secondary text shown beside the label. */
  additionalText?: string;
  /** @default false */
  /** Disables the option. Keyboard navigation skips it. */
  disabled?: boolean;
}
/** A labelled choice for Select. */
export function Option(_props: OptionProps): null {
  return null;
}

export interface OptionCustomProps {
  /** Accessible name and type-ahead text. */
  label: string;
  /** Machine-readable value. @default label */
  value?: string;
  /** Secondary text shown beside the custom content. */
  additionalText?: string;
  /** @default false */
  /** Disables the option. Keyboard navigation skips it. */
  disabled?: boolean;
  /** Visual content. The label remains the accessible name. */
  children?: ReactNode;
}
/** A Select choice with custom content. `label` remains the accessible name. */
export function OptionCustom(_props: OptionCustomProps): null {
  return null;
}

export interface OptionGroupProps {
  /** Visible group heading. */
  headerText: string;
  /** Accessible name when it should differ from the visible heading. */
  headerAccessibleName?: string;
  /** Content rendered inside the option group. */
  children?: ReactNode;
}
/** Groups Select options under a heading. The heading is not a selectable choice. */
export function OptionGroup(_props: OptionGroupProps): null {
  return null;
}

type OptionMarker = (props: OptionElementProps) => null;

interface OptionTypes {
  item: OptionMarker;
  custom: OptionMarker;
  group: OptionMarker;
}

/** Reads option elements into the listbox model. Unknown children are ignored. */
export function collectOptionElements(children: ReactNode, types: OptionTypes): SelectOption[] {
  const options: SelectOption[] = [];
  const visit = (nodes: ReactNode, group?: string, groupAccessibleName?: string) => {
    Children.forEach(nodes, (node) => {
      if (!isValidElement(node)) return;
      if (node.type === Fragment) {
        visit((node.props as { children?: ReactNode }).children, group, groupAccessibleName);
        return;
      }
      const props = node.props as OptionElementProps;
      if (node.type === types.group) {
        visit(props.children, props.headerText, props.headerAccessibleName);
        return;
      }
      const custom = node.type === types.custom;
      if (node.type !== types.item && !custom) return;
      const label = props.label ?? props.text ?? '';
      const value = props.value ?? label;
      if (!value) return;
      options.push({
        value,
        label: label || value,
        description: props.additionalText,
        disabled: props.disabled,
        group,
        groupAccessibleName,
        content: custom ? props.children : undefined,
      });
    });
  };
  visit(children);
  return options;
}
