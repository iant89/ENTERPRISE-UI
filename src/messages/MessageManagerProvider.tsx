import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react';
import type { FormErrorItem } from '../hooks/useForm';
import type { ValidationStatus } from '../utilities/types';
import { MessageStore, highestSeverity, matchesMessage, compareMessages, type AppMessage, type MessageFilter } from './MessageStore';
import { messagesFromFormErrors } from './sources';

const MessageStoreContext = createContext<MessageStore | null>(null);

export interface MessageManagerProviderProps {
  /** The store to share. Create one with `createMessageStore()` to add messages outside React (API clients, workers). One is created when omitted. */
  store?: MessageStore;
  /** Content that reads or adds messages. */
  children: ReactNode;
}

/** Shares one {@link MessageStore} with every message consumer and hook below it. */
export function MessageManagerProvider({ store, children }: MessageManagerProviderProps) {
  const [own] = useState(() => new MessageStore());
  return <MessageStoreContext.Provider value={store ?? own}>{children}</MessageStoreContext.Provider>;
}

/** Returns the store of the nearest {@link MessageManagerProvider}. */
export function useMessageStore(): MessageStore {
  const store = useContext(MessageStoreContext);
  if (!store) throw new Error('useMessageStore must be used within a <MessageManagerProvider>.');
  return store;
}

/** The given store, or the provider's; throws when there is neither. @internal */
export function useResolvedMessageStore(store?: MessageStore): MessageStore {
  const contextStore = useContext(MessageStoreContext);
  const active = store ?? contextStore;
  if (!active) throw new Error('Message components and hooks need a `store` or a <MessageManagerProvider>.');
  return active;
}

/** Subscribes to the messages that match a filter, most severe and newest first. */
export function useMessages(filter?: MessageFilter, store?: MessageStore): AppMessage[] {
  const active = useResolvedMessageStore(store);
  const snapshot = useSyncExternalStore(active.subscribe, active.getSnapshot, active.getSnapshot);
  // The filter is usually an inline object; its content, not its identity, decides the result.
  const key = JSON.stringify(filter ?? {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => snapshot.filter((m) => matchesMessage(m, filter)).sort(compareMessages), [snapshot, key, filter?.where]);
}

/** Validation props for a control derived from its field messages; spread them onto any form control. */
export interface FieldMessageState {
  /** Messages for the control, most severe first. */
  messages: AppMessage[];
  /** Error text, when the most severe message is an error. */
  error?: string;
  /** Value state of the most severe message. */
  status: ValidationStatus;
  /** Text of the most severe non-error message. */
  statusMessage?: string;
}

/**
 * Field messages for one control (its DOM id), e.g. a server-side error returned
 * for a field. Spread `error`, `status` and `statusMessage` onto the control.
 */
export function useFieldMessage(target: string, store?: MessageStore): FieldMessageState {
  const messages = useMessages({ scope: 'field', target }, store);
  const top = messages[0];
  const type = highestSeverity(messages);
  return {
    messages,
    error: type === 'error' ? top.title : undefined,
    status: type ?? 'none',
    statusMessage: type && type !== 'error' ? top.title : undefined,
  };
}

/** Options for {@link useFormMessages}. */
export interface UseFormMessagesOptions {
  /** Group for the form's messages; use a stable name per form. */
  group: string;
  /** Store to write to. Defaults to the provider's store. */
  store?: MessageStore;
  /** Publish errors only after the first submit, like an error summary. @default false */
  afterSubmit?: boolean;
}

/**
 * Publishes a `useForm` form's validation errors to the message store as field
 * messages, so a MessagePopover in the footer lists them and focuses the
 * field. Messages are replaced as errors change and removed on unmount.
 */
export function useFormMessages(form: { errorList: FormErrorItem[]; submitCount: number }, options: UseFormMessagesOptions): void {
  const store = useResolvedMessageStore(options.store);
  const { group, afterSubmit = false } = options;
  const errors = afterSubmit && form.submitCount === 0 ? [] : form.errorList;
  const key = JSON.stringify(errors);
  useEffect(() => {
    store.replaceGroup(group, 'validation', messagesFromFormErrors(errors, { group }));
    // `errors` is rebuilt every render; its content (key) decides when to sync.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, group, key]);
  useEffect(() => () => store.clear({ group, source: 'validation' }), [store, group]);
}
