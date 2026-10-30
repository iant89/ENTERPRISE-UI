import { Children, Fragment, isValidElement, type ReactNode } from 'react';
import type { ListItemData } from './List';

export type ListItemHighlight = 'none' | 'positive' | 'critical' | 'negative' | 'information';

export const listHighlightLabel: Record<Exclude<ListItemHighlight, 'none'>, string> = {
  positive: 'Positive',
  critical: 'Critical',
  negative: 'Negative',
  information: 'Information',
};

export interface ListItemStandardProps {
  /** Stable id. Generated from the text when omitted. */
  id?: string;
  /** Primary text. Also used for type-ahead. */
  text: string;
  description?: ReactNode;
  /** Trailing text, such as a status or amount. */
  additionalText?: ReactNode;
  /** Leading visual. Decorative icons should be hidden from assistive technology. */
  icon?: ReactNode;
  /** @default false */
  disabled?: boolean;
  /** Renders the row as a link when the list is not selectable. */
  href?: string;
  /** Status text and tone. The text is visible, not color alone. @default 'none' */
  highlight?: ListItemHighlight;
}
/** A text row for List. Selection and keyboard behavior come from the parent list. */
export function ListItemStandard(_props: ListItemStandardProps): null {
  return null;
}

export interface ListItemCustomProps {
  /** Stable id. Generated from the text when omitted. */
  id?: string;
  /** Accessible name and type-ahead text. */
  text: string;
  /** @default false */
  disabled?: boolean;
  /** Renders the row as a link when the list is not selectable. */
  href?: string;
  /** Row content. The text prop remains the accessible name when it is not visible. */
  children?: ReactNode;
}
/** A List row with custom content. `text` is the accessible name and type-ahead value. */
export function ListItemCustom(_props: ListItemCustomProps): null {
  return null;
}

export interface ListItemGroupProps {
  /** Visible group heading. */
  headerText: string;
  /** Accessible name when it should differ from the visible heading. */
  headerAccessibleName?: string;
  children?: ReactNode;
}
/** Groups list rows under a heading. The heading is not itself a row. */
export function ListItemGroup(_props: ListItemGroupProps): null {
  return null;
}

/** Reads list item elements into the List data model. Unknown children are ignored. */
export function readListItems(children: ReactNode): ListItemData[] {
  const items: ListItemData[] = [];
  const visit = (nodes: ReactNode, group?: string, groupAccessibleName?: string) => {
    Children.forEach(nodes, (node) => {
      if (!isValidElement(node)) return;
      if (node.type === Fragment) {
        visit((node.props as { children?: ReactNode }).children, group, groupAccessibleName);
        return;
      }
      if (node.type === ListItemGroup) {
        const props = node.props as ListItemGroupProps;
        visit(props.children, props.headerText, props.headerAccessibleName);
        return;
      }
      if (node.type !== ListItemStandard && node.type !== ListItemCustom) return;
      const props = node.props as ListItemStandardProps & ListItemCustomProps;
      const text = props.text ?? '';
      const highlight = props.highlight && props.highlight !== 'none' ? props.highlight : undefined;
      items.push({
        id: props.id ?? `item-${items.length}-${text}`,
        title: node.type === ListItemCustom ? props.children : text,
        textValue: text,
        description: node.type === ListItemStandard ? props.description : undefined,
        meta: node.type === ListItemStandard ? props.additionalText : undefined,
        leading: node.type === ListItemStandard ? props.icon : undefined,
        disabled: props.disabled,
        href: props.href,
        group,
        groupAccessibleName,
        highlight,
      });
    });
  };
  visit(children);
  return items;
}
