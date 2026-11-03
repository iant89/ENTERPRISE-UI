import { forwardRef, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cx } from '../../utilities/cx';
import { useId } from '../../hooks/useId';
import { useControllableState } from '../../hooks/useControllableState';
import styles from './Accordion.module.css';

export interface AccordionItem {
  id: string;
  /** Header text. */
  title: ReactNode;
  /** Secondary text in the header, e.g. a count or status. */
  subtitle?: ReactNode;
  /** Panel content. */
  content: ReactNode;
  /** Header cannot be toggled. */
  disabled?: boolean;
}

export interface AccordionProps extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  /** Sections in order. */
  items: AccordionItem[];
  /** `single` keeps one section open; `multiple` lets several open. @default 'single' */
  type?: 'single' | 'multiple';
  /** Open section ids. Providing it makes the accordion controlled. */
  value?: string[];
  /** Initially open sections when uncontrolled. @default [] */
  defaultValue?: string[];
  /** Called with the open section ids. */
  onValueChange?: (value: string[]) => void;
  /** In `single` mode, allows closing the open section. @default true */
  collapsible?: boolean;
  /** Heading level wrapping each header button. @default 3 */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Removes borders between sections. @default false */
  flush?: boolean;
}

/** Stacked sections that expand and collapse (WAI-ARIA accordion pattern). */
export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(function Accordion(
  { items, type = 'single', value, defaultValue = [], onValueChange, collapsible = true, headingLevel = 3, flush = false, className, ...rest },
  ref,
) {
  const id = useId(undefined, 'accordion');
  const [open, setOpen] = useControllableState(value, defaultValue, onValueChange);
  const Heading = `h${headingLevel}` as const;
  // APG: region landmarks only help when there are few sections.
  const asRegion = items.length <= 6;

  const toggle = (itemId: string) => {
    const isOpen = open.includes(itemId);
    if (type === 'single') {
      if (isOpen && !collapsible) return;
      setOpen(isOpen ? [] : [itemId]);
    } else setOpen(isOpen ? open.filter((o) => o !== itemId) : [...open, itemId]);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const headers = [...event.currentTarget.querySelectorAll<HTMLButtonElement>(`[data-accordion="${id}"]:not(:disabled)`)];
    const i = headers.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) return;
    const target = { ArrowDown: headers[(i + 1) % headers.length], ArrowUp: headers[(i - 1 + headers.length) % headers.length], Home: headers[0], End: headers[headers.length - 1] }[event.key];
    if (target) {
      event.preventDefault();
      target.focus();
    }
  };

  return (
    <div ref={ref} className={cx(styles.accordion, flush && styles.flush, className)} onKeyDown={onKeyDown} {...rest}>
      {items.map((item) => {
        const isOpen = open.includes(item.id);
        const headerId = `${id}-${item.id}-header`;
        const panelId = `${id}-${item.id}-panel`;
        return (
          <div key={item.id} className={cx(styles.item, isOpen && styles.open)}>
            <Heading className={styles.heading}>
              <button
                type="button"
                id={headerId}
                data-accordion={id}
                className={styles.trigger}
                aria-expanded={isOpen}
                aria-controls={panelId}
                aria-disabled={type === 'single' && isOpen && !collapsible ? true : undefined}
                disabled={item.disabled}
                onClick={() => toggle(item.id)}
              >
                <span className={styles.title}>{item.title}</span>
                {item.subtitle && <span className={styles.subtitle}>{item.subtitle}</span>}
                <ChevronDown aria-hidden="true" className={styles.chevron} />
              </button>
            </Heading>
            <div id={panelId} role={asRegion ? 'region' : undefined} aria-labelledby={asRegion ? headerId : undefined} className={styles.panel} hidden={!isOpen}>
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
});
