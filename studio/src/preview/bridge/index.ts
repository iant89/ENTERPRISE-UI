/**
 * Code Studio C4 (§9.4): the typed, versioned message bridge between a host page (Studio, the docs
 * playground) and the sandboxed preview frame. Shared by both sides; the frame is opaque-origin
 * (`sandbox="allow-scripts"`, never `allow-same-origin`), so every message is validated:
 * - `{ source: 'eui-preview', v: 1, type, payload }` only; unknown types are dropped.
 * - Each type has a payload validator.
 * - Frame → host messages over `MAX_FRAME_MESSAGE_BYTES` are dropped; console args are truncated in the frame.
 * - Hosts accept messages only when `event.source === frame.contentWindow`; the frame only from `window.parent`.
 */
export const BRIDGE_SOURCE = 'eui-preview';
export const BRIDGE_VERSION = 1;
/** Frame → host limit. */
export const MAX_FRAME_MESSAGE_BYTES = 64 * 1024;
/** Host → frame limit (an artifact may be large; the project limit is 10 MB). */
export const MAX_HOST_MESSAGE_BYTES = 12 * 1024 * 1024;
export const MAX_CONSOLE_ARG_CHARS = 2000;
export const TRUNCATED = '… [truncated]';

export type ConsoleLevel = 'log' | 'info' | 'warn' | 'error';
export interface SourceLocation { path: string | null; line: number | null; column: number | null }
export interface LayoutBox { id: string; x: number; y: number; width: number; height: number }

export interface HostMessages {
  init: Record<string, never>;
  /** Single-file code (docs playground, Design Studio). */
  render: { code: string; theme: string; density: string; design?: boolean };
  /** A compiled multi-file artifact (Code Studio). */
  run: { artifact: { hash: string; entry: string; modules: readonly { path: string; code: string; deps: Readonly<Record<string, string>> }[]; styles: readonly { path: string; text: string }[] }; theme: string; density: string };
  scroll: { deltaY: number };
}
export interface FrameMessages {
  ready: Record<string, never>;
  success: { hash?: string };
  error: { message: string } & Partial<SourceLocation>;
  'runtime-error': { message: string } & SourceLocation;
  console: { level: ConsoleLevel; args: string[] } & SourceLocation;
  layout: { nodes: LayoutBox[] };
}

/** `nonce`: set by the host on `init` and echoed by the frame runtime on every frame message (see hostBridge). */
export type Envelope<M, K extends keyof M = keyof M> = { source: typeof BRIDGE_SOURCE; v: typeof BRIDGE_VERSION; type: K; payload: M[K]; nonce?: string };
type Validators<M> = { [K in keyof M]: (p: unknown) => boolean };

const obj = (p: unknown): p is Record<string, unknown> => !!p && typeof p === 'object' && !Array.isArray(p);
const str = (v: unknown) => typeof v === 'string';
const num = (v: unknown) => typeof v === 'number' && Number.isFinite(v);
const optStr = (v: unknown) => v == null || str(v);
const optNum = (v: unknown) => v == null || num(v);
const loc = (p: Record<string, unknown>) => optStr(p.path) && optNum(p.line) && optNum(p.column);

export const hostValidators: Validators<HostMessages> = {
  init: obj,
  render: (p) => obj(p) && str(p.code) && str(p.theme) && str(p.density) && (p.design == null || typeof p.design === 'boolean'),
  run: (p) => obj(p) && str(p.theme) && str(p.density) && obj(p.artifact) && str(p.artifact.hash) && str(p.artifact.entry)
    && Array.isArray(p.artifact.modules) && p.artifact.modules.every((m) => obj(m) && str(m.path) && str(m.code) && obj(m.deps) && Object.values(m.deps).every(str))
    && Array.isArray(p.artifact.styles) && p.artifact.styles.every((s) => obj(s) && str(s.path) && str(s.text)),
  scroll: (p) => obj(p) && num(p.deltaY),
};
export const frameValidators: Validators<FrameMessages> = {
  ready: obj,
  success: (p) => obj(p) && optStr(p.hash),
  error: (p) => obj(p) && str(p.message) && loc(p),
  'runtime-error': (p) => obj(p) && str(p.message) && loc(p),
  console: (p) => obj(p) && ['log', 'info', 'warn', 'error'].includes(p.level as string) && Array.isArray(p.args) && p.args.every(str) && loc(p),
  layout: (p) => obj(p) && Array.isArray(p.nodes) && p.nodes.every((n) => obj(n) && str(n.id) && num(n.x) && num(n.y) && num(n.width) && num(n.height)),
};

export type DropReason = 'not-bridge' | 'version' | 'unknown-type' | 'bad-payload' | 'too-large';

/** Validates a message body. Returns the envelope, or why it was dropped. */
export function validate<M>(data: unknown, validators: Validators<M>, maxBytes: number): { ok: true; message: Envelope<M> } | { ok: false; reason: DropReason } {
  if (!obj(data) || data.source !== BRIDGE_SOURCE) return { ok: false, reason: 'not-bridge' };
  if (data.v !== BRIDGE_VERSION) return { ok: false, reason: 'version' };
  if (!str(data.type) || !Object.hasOwn(validators, data.type)) return { ok: false, reason: 'unknown-type' };
  let size: number;
  try { size = JSON.stringify(data.payload ?? null).length; } catch { return { ok: false, reason: 'bad-payload' }; }
  if (size > maxBytes) return { ok: false, reason: 'too-large' };
  if (!validators[data.type as keyof M](data.payload)) return { ok: false, reason: 'bad-payload' };
  return { ok: true, message: data as unknown as Envelope<M> };
}

export const envelope = <M, K extends keyof M>(type: K, payload: M[K], nonce?: string): Envelope<M, K> =>
  (nonce === undefined ? { source: BRIDGE_SOURCE, v: BRIDGE_VERSION, type, payload } : { source: BRIDGE_SOURCE, v: BRIDGE_VERSION, type, payload, nonce });

const newNonce = () => (globalThis.crypto?.randomUUID?.() ?? `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`);

/**
 * Host side: a typed poster and a listener that only accepts messages from `frame()`'s window carrying
 * the current nonce. A fresh nonce goes out with every `init` (each frame load, before any user code
 * runs); the frame runtime keeps it in its module closure, so user code cannot read or forge it.
 */
export function hostBridge(frame: () => HTMLIFrameElement | null, onMessage: (m: Envelope<FrameMessages>) => void) {
  let nonce = newNonce();
  const listener = (event: MessageEvent) => {
    const win = frame()?.contentWindow;
    if (!win || event.source !== win) return;
    if (!event.data || typeof event.data !== 'object' || (event.data as { nonce?: unknown }).nonce !== nonce) return;
    const r = validate(event.data, frameValidators, MAX_FRAME_MESSAGE_BYTES);
    if (r.ok) onMessage(r.message);
  };
  window.addEventListener('message', listener);
  return {
    post<K extends keyof HostMessages>(type: K, payload: HostMessages[K]) {
      if (type === 'init') nonce = newNonce();
      frame()?.contentWindow?.postMessage(envelope<HostMessages, K>(type, payload, type === 'init' ? nonce : undefined), '*');
    },
    dispose() { window.removeEventListener('message', listener); },
  };
}

/** Serialises one console argument for the host, truncated with a marker. */
export function formatConsoleArg(value: unknown, max = MAX_CONSOLE_ARG_CHARS): string {
  let text: string;
  if (typeof value === 'string') text = value;
  else if (value instanceof Error) text = `${value.name}: ${value.message}`;
  else if (typeof value === 'function') text = `ƒ ${value.name || 'anonymous'}()`;
  else if (typeof value === 'undefined') text = 'undefined';
  else if (typeof value === 'bigint' || typeof value === 'symbol') text = String(value);
  else {
    try {
      const seen = new WeakSet<object>();
      text = JSON.stringify(value, (_k, v: unknown) => {
        if (v && typeof v === 'object') { if (seen.has(v)) return '[Circular]'; seen.add(v); }
        return typeof v === 'bigint' ? `${v}n` : v;
      }) ?? String(value);
    } catch { text = String(value); }
  }
  return text.length > max ? text.slice(0, max) + TRUNCATED : text;
}

/** Console args that fit the frame message limit: each arg truncated, then the list cut with a marker. */
export function consoleArgs(values: readonly unknown[], budget = MAX_FRAME_MESSAGE_BYTES - 1024): string[] {
  const out: string[] = [];
  let used = 0;
  for (const v of values) {
    const s = formatConsoleArg(v);
    const cost = JSON.stringify(s).length + 1;
    if (used + cost > budget) { out.push(TRUNCATED); break; }
    out.push(s);
    used += cost;
  }
  return out;
}

/** `eui-preview/src/App.tsx:12:5` in a stack → the module location (the runtime tags each module with a sourceURL). */
export const SOURCE_URL_PREFIX = 'eui-preview/';
export function locationFromStack(stack: string | undefined, skip = 0): SourceLocation {
  const re = /eui-preview\/([^\s):]+):(\d+):(\d+)/g;
  let m: RegExpExecArray | null;
  let n = 0;
  while ((m = re.exec(stack ?? ''))) if (n++ >= skip) return { path: m[1], line: Number(m[2]), column: Number(m[3]) };
  return { path: null, line: null, column: null };
}
