import type { MessageType } from '../components/message-popover';
import type { FormErrorItem } from '../hooks/useForm';
import type { MessageInput, MessageScope, MessageStore } from './MessageStore';

/** Options for turning an API error into messages. */
export interface ApiMessageOptions {
  /** Group for the messages, e.g. the request or form name, so they can be replaced together. */
  group?: string;
  /** Scope of messages that are not about a field. @default 'global' */
  scope?: Exclude<MessageScope, 'field'>;
  /** Component id for `scope: 'component'`. */
  target?: string;
  /** Maps a backend target (e.g. `Quantity` or `/items/0/quantity`) to the DOM id of its control. Matched targets become field messages. */
  fieldTarget?: (target: string) => string | undefined;
  /** Title when the error carries no readable message. @default 'Something went wrong. Try again.' */
  fallbackTitle?: string;
}

type Loose = Record<string, unknown>;
const isObject = (v: unknown): v is Loose => typeof v === 'object' && v !== null;
const text = (v: unknown): string | undefined => {
  if (typeof v === 'string' && v.trim()) return v.trim();
  if (isObject(v) && typeof v.value === 'string') return v.value; // OData V2: { message: { lang, value } }
  return undefined;
};

/** OData V4 `@Common.numericSeverity`: 1 success, 2 information, 3 warning, 4 error. */
const NUMERIC_SEVERITY: Record<number, string> = { 1: 'success', 2: 'info', 3: 'warning', 4: 'error' };

/** Maps backend severity words (OData, SAP, HTTP) to a message type. */
export function severityToType(severity: unknown, fallback: MessageType = 'error'): MessageType {
  const s = String(severity ?? '').toLowerCase();
  if (s.startsWith('err') || s === 'abort' || s === 'fatal') return 'error';
  if (s.startsWith('warn')) return 'warning';
  if (s.startsWith('info')) return 'information';
  if (s.startsWith('succ')) return 'success';
  return fallback;
}

/**
 * Converts an API error into messages. Understands OData V2/V4 errors
 * (`{ error: { code, message, details[] } }`), RFC 9457 problem details
 * (`title`, `detail`, `errors`, `invalid-params`), `{ message }` bodies,
 * `Error` objects and plain strings. Details with a target that `fieldTarget`
 * resolves become field messages. Aborted requests produce no messages.
 */
export function messagesFromApiError(error: unknown, options: ApiMessageOptions = {}): MessageInput[] {
  const { group, scope = 'global', target, fieldTarget, fallbackTitle = 'Something went wrong. Try again.' } = options;
  if (isObject(error) && error.name === 'AbortError') return [];
  const base = { group, source: 'api' as const, scope, target: scope === 'component' ? target : undefined };

  const detail = (title: string, type: MessageType, backendTarget?: string, code?: string): MessageInput => {
    const control = backendTarget ? fieldTarget?.(backendTarget) : undefined;
    return control
      ? { ...base, scope: 'field', target: control, type, title, subtitle: backendTarget, code }
      : { ...base, type, title, subtitle: backendTarget || undefined, code };
  };

  if (typeof error === 'string') return [{ ...base, type: 'error', title: error }];
  if (!isObject(error)) return [{ ...base, type: 'error', title: fallbackTitle }];

  // OData V2 / V4 error body.
  if (isObject(error.error)) {
    const e = error.error;
    const code = typeof e.code === 'string' ? e.code : undefined;
    const main = detail(text(e.message) ?? fallbackTitle, severityToType(e.severity), typeof e.target === 'string' ? e.target : undefined, code);
    const inner = isObject(e.innererror) && Array.isArray(e.innererror.errordetails) ? e.innererror.errordetails : [];
    const details = (Array.isArray(e.details) ? e.details : inner).filter(isObject).map((d) =>
      detail(text(d.message) ?? fallbackTitle, severityToType(d.severity ?? NUMERIC_SEVERITY[Number(d['@Common.numericSeverity'])]), typeof d.target === 'string' ? d.target : undefined, typeof d.code === 'string' ? d.code : undefined),
    );
    // V2 repeats the main message as the first detail.
    return [main, ...details.filter((d) => !(d.title === main.title && d.code === main.code))];
  }

  // Problem details (RFC 9457) and common validation shapes.
  const status = typeof error.status === 'number' ? error.status : undefined;
  const title = text(error.title) ?? text(error.message) ?? fallbackTitle;
  const messages: MessageInput[] = [];
  const params = Array.isArray(error['invalid-params']) ? error['invalid-params'] : Array.isArray(error.errors) ? error.errors : [];
  for (const p of params.filter(isObject)) {
    const name = [p.name, p.field, p.pointer, p.path].find((v) => typeof v === 'string') as string | undefined;
    messages.push(detail(text(p.reason) ?? text(p.message) ?? text(p.detail) ?? fallbackTitle, severityToType(p.severity), name));
  }
  if (isObject(error.errors) && !Array.isArray(error.errors)) {
    for (const [name, list] of Object.entries(error.errors)) {
      for (const m of Array.isArray(list) ? list : [list]) if (text(m)) messages.push(detail(text(m)!, 'error', name));
    }
  }
  const technical = [status ? `HTTP ${status}` : undefined, typeof error.type === 'string' ? error.type : undefined, typeof error.instance === 'string' ? error.instance : undefined].filter(Boolean).join(' · ');
  const summary: MessageInput = { ...base, type: 'error', title, description: text(error.detail), technicalDetails: technical || undefined, code: typeof error.code === 'string' ? error.code : undefined };
  return [summary, ...messages];
}

/**
 * Reads a failed `fetch` Response (JSON body when there is one) and converts it
 * with {@link messagesFromApiError}. Bodies that are not JSON fall back to the HTTP status.
 */
export async function messagesFromResponse(response: Response, options: ApiMessageOptions = {}): Promise<MessageInput[]> {
  let body: unknown;
  try {
    body = await response.clone().json();
  } catch {
    body = undefined;
  }
  if (isObject(body)) {
    const status = body.status ?? response.status;
    return messagesFromApiError(isObject(body.error) ? body : { ...body, status }, options);
  }
  return messagesFromApiError({ title: options.fallbackTitle ?? `The request failed (${response.status}${response.statusText ? ` ${response.statusText}` : ''}).`, status: response.status }, options);
}

/** Converts `useForm` errors (`form.errorList`) into field messages pointing at their controls. */
export function messagesFromFormErrors(errors: readonly FormErrorItem[], options: { group?: string; type?: MessageType } = {}): MessageInput[] {
  return errors.map((e) => ({
    id: `${options.group ?? 'form'}:${e.name}`,
    type: options.type ?? 'error',
    title: e.message,
    subtitle: e.label,
    scope: 'field' as const,
    target: e.id,
    group: options.group,
    source: 'validation' as const,
  }));
}

/** Options for {@link trackOperation}. */
export interface TrackOperationOptions<T> {
  /** Message shown while the operation runs, e.g. "Exporting 2,400 orders…". */
  pending: string;
  /** Message when it succeeds; omit to just remove the pending message. */
  success?: string | ((result: T) => string);
  /** Headline when it fails. The parsed error becomes its description. Defaults to the parsed error. */
  error?: string;
  /** Id of the operation's message, so a second run replaces the first. */
  id?: string;
  /** Group for the operation's messages. */
  group?: string;
  /** Remove the success message after this many milliseconds. */
  successExpiresIn?: number;
  /** Options for parsing the error. */
  api?: Omit<ApiMessageOptions, 'group'>;
}

let operationCounter = 0;

/**
 * Reports a background operation: an information message while it runs, then a
 * success message (shown as a toast) or the errors it failed with. Resolves or
 * rejects like the operation itself.
 */
export async function trackOperation<T>(store: MessageStore, operation: Promise<T> | (() => Promise<T>), options: TrackOperationOptions<T>): Promise<T> {
  const id = options.id ?? `operation-${++operationCounter}`;
  store.add({ id, type: 'information', title: options.pending, source: 'background', scope: 'global', group: options.group, toast: false });
  try {
    const result = await (typeof operation === 'function' ? operation() : operation);
    if (options.success) {
      const title = typeof options.success === 'function' ? options.success(result) : options.success;
      store.add({ id, type: 'success', title, source: 'background', scope: 'global', group: options.group, toast: true, expiresIn: options.successExpiresIn });
    } else {
      store.remove(id);
    }
    return result;
  } catch (error) {
    store.remove(id);
    const parsed = messagesFromApiError(error, { ...options.api, group: options.group }).map((m) => ({ ...m, source: 'background' as const, toast: m.scope === 'global' }));
    if (parsed.length && options.error) parsed[0] = { ...parsed[0], description: parsed[0].title, title: options.error };
    store.addAll(parsed.map((m, i) => (i === 0 ? { ...m, id } : m)));
    throw error;
  }
}
