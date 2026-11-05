import { useMemo, useState, type ReactNode } from 'react';
import { IconProvider } from '../../icons';
import { cx } from '../../utilities/cx';
import { Button } from '../button';
import { Popover } from '../popover';
import styles from './MessagePopover.module.css';

export type MessageType = 'error' | 'warning' | 'information' | 'success';

export interface MessageItem {
  /** Unique id. */
  id: string;
  type: MessageType;
  /** Short message, e.g. "Enter a supplier." */
  title: string;
  /** Longer explanation. */
  description?: ReactNode;
  /** Field or section the message belongs to, e.g. "Supplier". */
  subtitle?: string;
  /** Id of the element to focus when the message is chosen (usually the field). */
  targetId?: string;
}

export interface MessagePopoverLabels {
  /** Trigger text and accessible name for the counts. */
  trigger: (counts: Record<MessageType, number>) => string;
  title: string;
  all: string;
  types: Record<MessageType, string>;
  empty: string;
}

export interface MessagePopoverProps {
  /** Messages from validation or the server. */
  messages: MessageItem[];
  /** Called when a message is chosen. By default focus moves to `targetId`. */
  onMessageSelect?: (message: MessageItem) => void;
  /** Whether it is open. Providing it makes the open state controlled. */
  open?: boolean;
  /** Called with the new open state. */
  onOpenChange?: (open: boolean) => void;
  /** Overrides for the built-in strings. */
  labels?: Partial<MessagePopoverLabels>;
  /** Class name for the trigger button. */
  className?: string;
}

const ICONS = { error: 'message-error', warning: 'warning2', information: 'message-information', success: 'message-success' } as const;
const ORDER: MessageType[] = ['error', 'warning', 'information', 'success'];

const defaultLabels: MessagePopoverLabels = {
  trigger: (c) =>
    [c.error && `${c.error} ${c.error === 1 ? 'error' : 'errors'}`, c.warning && `${c.warning} ${c.warning === 1 ? 'warning' : 'warnings'}`, c.information && `${c.information} info`]
      .filter(Boolean)
      .join(', ') || 'No messages',
  title: 'Messages',
  all: 'All',
  types: { error: 'Errors', warning: 'Warnings', information: 'Information', success: 'Success' },
  empty: 'No messages',
};

/**
 * Fiori message handling: a footer button with message counts that opens a filterable list of
 * errors and warnings; choosing one moves focus to the field it is about.
 */
export function MessagePopover({ messages, onMessageSelect, open, onOpenChange, labels: labelOverrides, className }: MessagePopoverProps) {
  const labels = { ...defaultLabels, ...labelOverrides, types: { ...defaultLabels.types, ...labelOverrides?.types } };
  const [filter, setFilter] = useState<MessageType | 'all'>('all');
  const counts = useMemo(() => {
    const c = { error: 0, warning: 0, information: 0, success: 0 } as Record<MessageType, number>;
    messages.forEach((m) => c[m.type]++);
    return c;
  }, [messages]);
  const worst = ORDER.find((t) => counts[t] > 0) ?? 'information';
  const TriggerIcon = ICONS[worst];
  const shown = (filter === 'all' ? messages : messages.filter((m) => m.type === filter)).slice().sort((a, b) => ORDER.indexOf(a.type) - ORDER.indexOf(b.type));
  const types = ORDER.filter((t) => counts[t] > 0);

  const choose = (message: MessageItem, close: () => void) => {
    close();
    if (onMessageSelect) onMessageSelect(message);
    else if (message.targetId) {
      // Wait for the popover to restore focus to its trigger before moving it to the field.
      setTimeout(() => {
        const el = document.getElementById(message.targetId!);
        el?.focus();
        el?.scrollIntoView?.({ block: 'center' });
      }, 0);
    }
  };

  return (
    <Popover
      title={labels.title}
      open={open}
      onOpenChange={onOpenChange}
      placement="top-start"
      width="24rem"
      trigger={
        <Button variant={messages.length ? 'secondary' : 'tertiary'} size="sm" className={cx(styles.trigger, styles[worst], className)} icon={IconProvider.getIcon(TriggerIcon)}>
          {labels.trigger(counts)}
        </Button>
      }
    >
      {(close) => (
        <div className={styles.body}>
          {types.length > 1 && (
            <div className={styles.filters} role="group" aria-label={labels.title}>
              {(['all', ...types] as const).map((t) => (
                <button key={t} type="button" className={styles.filter} aria-pressed={filter === t} onClick={() => setFilter(t)}>
                  {t === 'all' ? `${labels.all} (${messages.length})` : `${labels.types[t]} (${counts[t]})`}
                </button>
              ))}
            </div>
          )}
          {shown.length === 0 ? (
            <p className={styles.empty}>{labels.empty}</p>
          ) : (
            <ul className={styles.list}>
              {shown.map((m) => {
                const Icon = ICONS[m.type];
                return (
                  <li key={m.id}>
                    <button type="button" className={styles.item} onClick={() => choose(m, close)}>
                      {IconProvider.getIcon(Icon, { 'aria-hidden': 'true', className: cx(styles.icon, styles[m.type]) })}
                      <span className={styles.text}>
                        <span className="eui-visually-hidden">{labels.types[m.type]}: </span>
                        <span className={styles.itemTitle}>{m.title}</span>
                        {m.subtitle && <span className={styles.subtitle}>{m.subtitle}</span>}
                        {m.description && <span className={styles.description}>{m.description}</span>}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </Popover>
  );
}
