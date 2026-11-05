import { forwardRef, useEffect, useRef, type HTMLAttributes } from 'react';
import { MessagePopover, type MessageItem, type MessagePopoverProps } from '../components/message-popover';
import { MessageStrip } from '../components/message-strip';
import { useToast } from '../components/toast';
import { cx } from '../utilities/cx';
import { useMessages, useResolvedMessageStore as useMessageStoreOptional } from './MessageManagerProvider';
import type { AppMessage, MessageFilter, MessageStore } from './MessageStore';
import { MessageView, focusMessageTarget, type MessageViewProps } from './message-view/MessageView';
import styles from './consumers.module.css';

const toItem = (m: AppMessage): MessageItem => ({ id: m.id, type: m.type, title: m.title, description: m.description, subtitle: m.subtitle, targetId: m.scope === 'field' ? m.target : undefined });

export interface ManagedMessagePopoverProps extends Omit<MessagePopoverProps, 'messages'> {
  /** Messages to list. @default every message except global success messages */
  filter?: MessageFilter;
  /** Render nothing while there are no matching messages. @default true */
  hideWhenEmpty?: boolean;
  /** Store to read. Defaults to the provider's store. */
  store?: MessageStore;
}

const notGlobalSuccess: MessageFilter = { where: (m) => !(m.scope === 'global' && m.type === 'success') };

/** MessagePopover fed by the message store. Opening it marks the listed messages as read. */
export function ManagedMessagePopover({ filter = notGlobalSuccess, hideWhenEmpty = true, store, onOpenChange, ...rest }: ManagedMessagePopoverProps) {
  const contextStore = useMessageStoreOptional(store);
  const messages = useMessages(filter, contextStore);
  if (hideWhenEmpty && messages.length === 0) return null;
  return (
    <MessagePopover
      {...rest}
      messages={messages.map(toItem)}
      onOpenChange={(open) => {
        if (open) contextStore.markRead({ ...filter, where: (m) => messages.some((s) => s.id === m.id) });
        onOpenChange?.(open);
      }}
    />
  );
}

export interface ManagedMessageStripsProps extends HTMLAttributes<HTMLDivElement> {
  /** Messages to show as strips. Use `{ scope: 'component', target: 'my-table' }` above a component. @default { scope: 'global' } */
  filter?: MessageFilter;
  /** Most strips to show; the most severe and newest come first. @default 3 */
  max?: number;
  /** Let the user dismiss a strip, which removes its message from the store. @default true */
  dismissible?: boolean;
  /** Announce new strips (errors assertively, others politely). Turn off when toasts already announce them. @default true */
  announce?: boolean;
  /** Text after the strips when more messages match than are shown. */
  moreLabel?: (count: number) => string;
  /** Store to read. Defaults to the provider's store. */
  store?: MessageStore;
}

/** A stack of MessageStrips for global or component messages from the store. */
export const ManagedMessageStrips = forwardRef<HTMLDivElement, ManagedMessageStripsProps>(function ManagedMessageStrips(
  { filter = { scope: 'global' }, max = 3, dismissible = true, announce = true, moreLabel = (n) => `${n} more ${n === 1 ? 'message' : 'messages'}`, store, className, ...rest },
  ref,
) {
  const active = useMessageStoreOptional(store);
  const messages = useMessages(filter, active);
  if (messages.length === 0) return null;
  const shown = messages.slice(0, max);
  return (
    <div ref={ref} className={cx(styles.strips, className)} {...rest}>
      {shown.map((m) => (
        <MessageStrip
          key={m.id}
          tone={m.type}
          title={m.description ? m.title : undefined}
          announce={announce ? (m.type === 'error' ? 'assertive' : 'polite') : 'off'}
          dismissible={dismissible}
          onDismiss={() => active.remove(m.id)}
        >
          {m.description ?? m.title}
        </MessageStrip>
      ))}
      {messages.length > shown.length && <p className={styles.more}>{moreLabel(messages.length - shown.length)}</p>}
    </div>
  );
});

export interface ManagedMessageViewProps extends Omit<MessageViewProps, 'messages' | 'onDismiss' | 'onClearAll'> {
  /** Messages to list. @default every message */
  filter?: MessageFilter;
  /** Let the user remove messages one by one and all at once. @default true */
  removable?: boolean;
  /** Mark listed messages as read once they have been shown. @default true */
  markAsRead?: boolean;
  /** Store to read. Defaults to the provider's store. */
  store?: MessageStore;
}

/** MessageView fed by the message store: removing a message removes it from the store. */
export const ManagedMessageView = forwardRef<HTMLElement, ManagedMessageViewProps>(function ManagedMessageView(
  { filter, removable = true, markAsRead = true, store, onMessageSelect, ...rest },
  ref,
) {
  const active = useMessageStoreOptional(store);
  const messages = useMessages(filter, active);
  const unread = messages.filter((m) => !m.read).map((m) => m.id);
  const unreadKey = unread.join('|');
  useEffect(() => {
    // Marked after paint, so the unread marker is visible on first sight.
    if (!markAsRead || !unreadKey) return;
    const ids = unreadKey.split('|');
    const timer = setTimeout(() => active.markRead({ where: (m) => ids.includes(m.id) }), 1500);
    return () => clearTimeout(timer);
  }, [active, markAsRead, unreadKey]);
  return (
    <MessageView
      ref={ref}
      {...rest}
      messages={messages}
      onMessageSelect={onMessageSelect ?? ((m) => focusMessageTarget(m))}
      onDismiss={removable ? (m) => active.remove(m.id) : undefined}
      onClearAll={removable ? () => active.clear(filter) : undefined}
    />
  );
});

export interface MessageToastBridgeProps {
  /** Decides which new messages become toasts. @default `message.toast`, else global event and background messages */
  shouldToast?: (message: AppMessage) => boolean;
  /** Auto-dismiss delay for the toasts (errors stay until dismissed). */
  duration?: number;
  /** Store to watch. Defaults to the provider's store. */
  store?: MessageStore;
}

const defaultShouldToast = (m: AppMessage) => m.toast ?? (m.scope === 'global' && (m.source === 'event' || m.source === 'background'));

/**
 * Shows new store messages as toasts through the surrounding ToastProvider.
 * Render it once inside both providers. A message that changes (e.g. a background
 * operation finishing) updates its toast; removing a message dismisses its toast.
 */
export function MessageToastBridge({ shouldToast = defaultShouldToast, duration, store }: MessageToastBridgeProps) {
  const active = useMessageStoreOptional(store);
  const toast = useToast();
  const shown = useRef(new Map<string, string>());
  const options = useRef({ shouldToast, duration });
  options.current = { shouldToast, duration };

  useEffect(() => {
    const sync = () => {
      const messages = active.getSnapshot();
      const ids = new Set(messages.map((m) => m.id));
      for (const [id] of shown.current) {
        if (!ids.has(id)) {
          shown.current.delete(id);
          toast.dismiss(id);
        }
      }
      for (const m of messages) {
        const signature = `${m.type}|${m.title}`;
        if (shown.current.get(m.id) === signature) continue;
        const wanted = options.current.shouldToast(m);
        if (wanted) {
          shown.current.set(m.id, signature);
          toast.show({ id: m.id, title: m.title, description: m.description, tone: m.type, duration: options.current.duration });
        } else if (shown.current.has(m.id)) {
          shown.current.delete(m.id);
          toast.dismiss(m.id);
        }
      }
    };
    // Messages that exist before the bridge mounts are not toasted; they are not new.
    for (const m of active.getSnapshot()) shown.current.set(m.id, `${m.type}|${m.title}`);
    return active.subscribe(sync);
  }, [active, toast]);

  return null;
}
