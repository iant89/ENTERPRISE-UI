import { forwardRef, useState, type HTMLAttributes } from 'react';
import { Button } from '../../components/button';
import { IconButton } from '../../components/icon-button';
import type { MessageType } from '../../components/message-popover';
import { cx } from '../../utilities/cx';
import { compareMessages, countMessages, type AppMessage, type MessageSource } from '../MessageStore';
import styles from './MessageView.module.css';
import declineSvg from '../../assets/icons/decline.svg?raw';
import messageErrorSvg from '../../assets/icons/message-error.svg?raw';
import messageInformationSvg from '../../assets/icons/message-information.svg?raw';
import messageSuccessSvg from '../../assets/icons/message-success.svg?raw';
import warning2Svg from '../../assets/icons/warning2.svg?raw';
import { svgIcon } from '../../icons/svgIcon';

/** Strings of MessageView. */
export interface MessageViewLabels {
  /** Accessible name of the view and its filter group. */
  title: string;
  /** "All" filter button. */
  all: string;
  /** Type names, used for filters and the hidden type prefix of each message. */
  types: Record<MessageType, string>;
  /** Source names shown in each message's details line. */
  sources: Partial<Record<MessageSource, string>>;
  /** Text when there are no messages. */
  empty: string;
  /** Button that removes every message. */
  clearAll: string;
  /** Accessible name of a message's remove button. */
  dismiss: (title: string) => string;
  /** Summary of the technical details disclosure. */
  technicalDetails: string;
}

const defaultLabels: MessageViewLabels = {
  title: 'Messages',
  all: 'All',
  types: { error: 'Errors', warning: 'Warnings', information: 'Information', success: 'Success' },
  sources: { validation: 'Validation', api: 'Server', event: 'Application', background: 'Background task' },
  empty: 'No messages',
  clearAll: 'Clear all',
  dismiss: (title) => `Remove message: ${title}`,
  technicalDetails: 'Technical details',
};

const ICONS: Record<MessageType, [string, string]> = {
  error: [messageErrorSvg, 'message-error'],
  warning: [warning2Svg, 'warning2'],
  information: [messageInformationSvg, 'message-information'],
  success: [messageSuccessSvg, 'message-success'],
};
const ORDER: MessageType[] = ['error', 'warning', 'information', 'success'];

export interface MessageViewProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Messages to list. They are shown most severe and newest first. */
  messages: readonly AppMessage[];
  /** Called when the user chooses a message with a target. Without it, field messages focus their control. */
  onMessageSelect?: (message: AppMessage) => void;
  /** Called when the user removes a message. A remove button is shown only when this is set. */
  onDismiss?: (message: AppMessage) => void;
  /** Called when the user removes every message. A Clear all button is shown only when this is set. */
  onClearAll?: () => void;
  /** Show type filter buttons when there is more than one type. @default true */
  showFilters?: boolean;
  /** Show the source and time of each message. @default true */
  showDetails?: boolean;
  /** BCP 47 locale for times. Defaults to the browser locale. */
  locale?: string;
  /** Overrides for the built-in strings. */
  labels?: Partial<MessageViewLabels>;
}

/** Moves focus to a field message's control. */
export function focusMessageTarget(message: Pick<AppMessage, 'scope' | 'target'>) {
  if (!message.target) return;
  const el = document.getElementById(message.target);
  el?.focus();
  el?.scrollIntoView?.({ block: 'center' });
}

/**
 * A full list of application messages for a page, side panel or dialog: type
 * filters, severity order, source and time, collapsible technical details,
 * navigation to the affected field and optional removal.
 */
export const MessageView = forwardRef<HTMLElement, MessageViewProps>(function MessageView(
  { messages, onMessageSelect, onDismiss, onClearAll, showFilters = true, showDetails = true, locale, labels: labelOverrides, className, ...rest },
  ref,
) {
  const labels = { ...defaultLabels, ...labelOverrides, types: { ...defaultLabels.types, ...labelOverrides?.types }, sources: { ...defaultLabels.sources, ...labelOverrides?.sources } };
  const [filter, setFilter] = useState<MessageType | 'all'>('all');
  const counts = countMessages(messages);
  const types = ORDER.filter((t) => counts[t] > 0);
  const active = filter !== 'all' && counts[filter] === 0 ? 'all' : filter;
  const shown = [...messages].filter((m) => active === 'all' || m.type === active).sort(compareMessages);
  const time = new Intl.DateTimeFormat(locale, { timeStyle: 'short' });

  const select = (message: AppMessage) => (onMessageSelect ? onMessageSelect(message) : focusMessageTarget(message));
  const navigable = (m: AppMessage) => !!m.target && (!!onMessageSelect || m.scope === 'field');

  return (
    <section ref={ref} aria-label={labels.title} className={cx(styles.root, className)} {...rest}>
      {(showFilters && types.length > 1) || (onClearAll && messages.length > 0) ? (
        <div className={styles.toolbar}>
          {showFilters && types.length > 1 && (
            <div className={styles.filters} role="group" aria-label={labels.title}>
              {(['all', ...types] as const).map((t) => (
                <button key={t} type="button" className={styles.filter} aria-pressed={active === t} onClick={() => setFilter(t)}>
                  {t === 'all' ? `${labels.all} (${messages.length})` : `${labels.types[t]} (${counts[t]})`}
                </button>
              ))}
            </div>
          )}
          {onClearAll && messages.length > 0 && (
            <Button size="sm" variant="tertiary" className={styles.clear} onClick={onClearAll}>
              {labels.clearAll}
            </Button>
          )}
        </div>
      ) : null}
      {shown.length === 0 ? (
        <p className={styles.empty}>{labels.empty}</p>
      ) : (
        <ul className={styles.list}>
          {shown.map((m) => {
            const [iconSvg, iconName] = ICONS[m.type];
            const title = (
              <>
                <span className="eui-visually-hidden">{labels.types[m.type]}:</span> {m.title}
              </>
            );
            return (
              <li key={m.id} className={cx(styles.item, styles[m.type], !m.read && styles.unread)}>
                {svgIcon(iconSvg, iconName, { 'aria-hidden': 'true', className: styles.icon })}
                <div className={styles.body}>
                  {navigable(m) ? (
                    <button type="button" className={styles.titleButton} onClick={() => select(m)}>
                      {title}
                    </button>
                  ) : (
                    <span className={styles.title}>{title}</span>
                  )}
                  {m.subtitle && <span className={styles.subtitle}>{m.subtitle}</span>}
                  {m.description && <div className={styles.description}>{m.description}</div>}
                  {showDetails && (
                    <span className={styles.meta}>
                      {[labels.sources[m.source] ?? m.source, m.code].filter(Boolean).join(' · ')}
                      {' · '}
                      <time dateTime={new Date(m.timestamp).toISOString()}>{time.format(m.timestamp)}</time>
                    </span>
                  )}
                  {m.technicalDetails && (
                    <details className={styles.technical}>
                      <summary>{labels.technicalDetails}</summary>
                      <pre>{m.technicalDetails}</pre>
                    </details>
                  )}
                </div>
                {onDismiss && <IconButton className={styles.dismiss} icon={svgIcon(declineSvg, 'decline')} label={labels.dismiss(m.title)} size="sm" neutral onClick={() => onDismiss(m)} />}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
});
