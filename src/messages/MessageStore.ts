import type { ReactNode } from 'react';
import type { MessageType } from '../components/message-popover';

/** Where a message applies: the whole application, one component (a section, table or card) or one field. */
export type MessageScope = 'global' | 'component' | 'field';

/** What produced a message. Custom strings are allowed for application-specific sources. */
export type MessageSource = 'validation' | 'api' | 'event' | 'background' | (string & {});

/** A message held by the {@link MessageStore}. */
export interface AppMessage {
  /** Unique id. Adding a message with an existing id replaces it. */
  id: string;
  /** Severity. */
  type: MessageType;
  /** Short, complete sentence. */
  title: string;
  /** Longer explanation or next step. */
  description?: ReactNode;
  /** Secondary text, usually the field or object the message is about. */
  subtitle?: string;
  /** Where the message applies. */
  scope: MessageScope;
  /** The component id (component scope) or DOM id of the control (field scope). Field messages focus it when chosen. */
  target?: string;
  /** Groups related messages, e.g. one form or one request, so they can be replaced or cleared together. */
  group?: string;
  /** What produced the message. */
  source: MessageSource;
  /** Machine-readable code from the backend, e.g. `MM/042`. */
  code?: string;
  /** Technical details for support (request id, status, raw message). Shown collapsed in MessageView. */
  technicalDetails?: string;
  /** When the message was added (ms since epoch). */
  timestamp: number;
  /** Whether the user has seen it in a MessageView or MessagePopover. */
  read: boolean;
  /** Show it as a toast too. Defaults to `true` for global event and background messages. */
  toast?: boolean;
  /** Remove the message automatically after this many milliseconds. */
  expiresIn?: number;
}

/** What callers pass to {@link MessageStore.add}; everything but `type` and `title` has a default. */
export type MessageInput = Omit<AppMessage, 'id' | 'scope' | 'source' | 'timestamp' | 'read'> & Partial<Pick<AppMessage, 'id' | 'scope' | 'source' | 'timestamp' | 'read'>>;

/** Selects messages. Every set criterion must match; array values match any of their entries. */
export interface MessageFilter {
  /** Scopes to include. */
  scope?: MessageScope | readonly MessageScope[];
  /** Types to include. */
  type?: MessageType | readonly MessageType[];
  /** Sources to include. */
  source?: MessageSource | readonly MessageSource[];
  /** Targets (component or control ids) to include. */
  target?: string | readonly string[];
  /** Groups to include. */
  group?: string | readonly string[];
  /** Custom condition. */
  where?: (message: AppMessage) => boolean;
}

const SEVERITY: Record<MessageType, number> = { error: 0, warning: 1, information: 2, success: 3 };

/** Orders messages by severity (errors first), then newest first. */
export const compareMessages = (a: AppMessage, b: AppMessage) => SEVERITY[a.type] - SEVERITY[b.type] || b.timestamp - a.timestamp;

const oneOf = <V>(criterion: V | readonly V[] | undefined, value: V | undefined) =>
  criterion === undefined || (Array.isArray(criterion) ? (criterion as readonly V[]).includes(value as V) : criterion === value);

/** Whether a message satisfies a filter. */
export function matchesMessage(message: AppMessage, filter: MessageFilter = {}): boolean {
  return (
    oneOf(filter.scope, message.scope) &&
    oneOf(filter.type, message.type) &&
    oneOf(filter.source, message.source) &&
    oneOf(filter.target, message.target) &&
    oneOf(filter.group, message.group) &&
    (!filter.where || filter.where(message))
  );
}

/** Counts messages per type. */
export function countMessages(messages: readonly AppMessage[]): Record<MessageType, number> {
  const counts: Record<MessageType, number> = { error: 0, warning: 0, information: 0, success: 0 };
  for (const m of messages) counts[m.type]++;
  return counts;
}

/** The most severe type among the messages, or `undefined` when there are none. */
export const highestSeverity = (messages: readonly AppMessage[]): MessageType | undefined => [...messages].sort(compareMessages)[0]?.type;

type Listener = () => void;

/**
 * Framework-independent store for application messages: global, component and
 * field-validation messages from any source, with subscriptions for the UI.
 * Every change produces a new immutable snapshot, so it works with `useSyncExternalStore`.
 */
export class MessageStore {
  private messages: AppMessage[] = [];
  private listeners = new Set<Listener>();
  private timers = new Map<string, ReturnType<typeof setTimeout>>();
  private counter = 0;

  /** Current messages, in insertion order. The array is replaced on every change. */
  getSnapshot = (): readonly AppMessage[] => this.messages;

  /** Calls the listener after every change. Returns an unsubscribe function. */
  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  /** Messages that match the filter, most severe and newest first. */
  get(filter?: MessageFilter): AppMessage[] {
    return this.messages.filter((m) => matchesMessage(m, filter)).sort(compareMessages);
  }

  /** Adds a message (or replaces one with the same id) and returns its id. */
  add(input: MessageInput): string {
    return this.addAll([input])[0];
  }

  /** Adds several messages with one change notification. Returns their ids. */
  addAll(inputs: readonly MessageInput[]): string[] {
    if (!inputs.length) return [];
    const now = Date.now();
    const added = inputs.map((input) => this.normalize(input, now));
    const ids = new Set(added.map((m) => m.id));
    this.commit([...this.messages.filter((m) => !ids.has(m.id)), ...added]);
    added.forEach((m) => this.schedule(m));
    return added.map((m) => m.id);
  }

  /** Changes fields of a message. */
  update(id: string, patch: Partial<Omit<AppMessage, 'id'>>): void {
    if (!this.messages.some((m) => m.id === id)) return;
    this.commit(this.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)));
    const updated = this.messages.find((m) => m.id === id)!;
    if ('expiresIn' in patch) this.schedule(updated);
  }

  /** Removes messages by id. */
  remove(ids: string | readonly string[]): void {
    const list = typeof ids === 'string' ? [ids] : ids;
    this.removeWhere((m) => list.includes(m.id));
  }

  /** Removes every message that matches the filter (all messages without one). */
  clear(filter?: MessageFilter): void {
    this.removeWhere((m) => matchesMessage(m, filter));
  }

  /** Marks matching messages as read. */
  markRead(filter?: MessageFilter): void {
    if (!this.messages.some((m) => !m.read && matchesMessage(m, filter))) return;
    this.commit(this.messages.map((m) => (!m.read && matchesMessage(m, filter) ? { ...m, read: true } : m)));
  }

  /**
   * Replaces every message of a group from one source in a single change, e.g.
   * the current validation errors of a form. Messages that are still present keep
   * their id, timestamp and read state, so lists do not jump.
   */
  replaceGroup(group: string, source: MessageSource, inputs: readonly MessageInput[]): void {
    const now = Date.now();
    const previous = new Map(this.messages.filter((m) => m.group === group && m.source === source).map((m) => [m.id, m]));
    const next = inputs.map((input) => {
      const message = this.normalize({ ...input, group, source }, now);
      const old = previous.get(message.id);
      return old && old.title === message.title && old.type === message.type ? { ...message, timestamp: old.timestamp, read: old.read } : message;
    });
    const unchanged = next.length === previous.size && next.every((m) => {
      const old = previous.get(m.id);
      return old && old.title === m.title && old.type === m.type && old.target === m.target && old.subtitle === m.subtitle;
    });
    if (unchanged) return;
    for (const id of previous.keys()) this.cancel(id);
    this.commit([...this.messages.filter((m) => !(m.group === group && m.source === source)), ...next]);
    next.forEach((m) => this.schedule(m));
  }

  /** Adds a global message from an application event. */
  notify(type: MessageType, title: string, options: Partial<MessageInput> = {}): string {
    return this.add({ scope: 'global', source: 'event', ...options, type, title });
  }

  private normalize(input: MessageInput, now: number): AppMessage {
    return { ...input, id: input.id ?? `msg-${++this.counter}`, scope: input.scope ?? 'global', source: input.source ?? 'event', timestamp: input.timestamp ?? now, read: input.read ?? false };
  }

  private removeWhere(predicate: (m: AppMessage) => boolean) {
    const kept = this.messages.filter((m) => !predicate(m));
    if (kept.length === this.messages.length) return;
    this.messages.filter(predicate).forEach((m) => this.cancel(m.id));
    this.commit(kept);
  }

  private schedule(message: AppMessage) {
    this.cancel(message.id);
    if (message.expiresIn && message.expiresIn > 0) {
      this.timers.set(message.id, setTimeout(() => this.remove(message.id), message.expiresIn));
    }
  }

  private cancel(id: string) {
    const timer = this.timers.get(id);
    if (timer) clearTimeout(timer);
    this.timers.delete(id);
  }

  private commit(next: AppMessage[]) {
    this.messages = next;
    this.listeners.forEach((l) => l());
  }
}

/** Creates a message store, e.g. one per application or per test. */
export const createMessageStore = () => new MessageStore();
