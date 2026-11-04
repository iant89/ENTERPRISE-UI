/** Code Studio C4: the Console tab's entries (capped; cleared on each successful reload). */
import type { ConsoleLevel, SourceLocation } from './bridge';

export const CONSOLE_CAP = 500;
export interface ConsoleEntry extends SourceLocation { id: number; level: ConsoleLevel | 'uncaught'; text: string }
export interface ConsoleState { entries: ConsoleEntry[]; next: number; /** Entries dropped because of the cap. */ dropped: number }
export interface ConsoleInput { level: ConsoleEntry['level']; args: readonly string[]; location: SourceLocation }
export type ConsoleAction = ({ type: 'add' } & ConsoleInput) | { type: 'addMany'; items: readonly ConsoleInput[] } | { type: 'clear' };

export const EMPTY_CONSOLE: ConsoleState = { entries: [], next: 1, dropped: 0 };

export function consoleReducer(state: ConsoleState, action: ConsoleAction): ConsoleState {
  if (action.type === 'clear') return state.entries.length || state.dropped ? { ...EMPTY_CONSOLE, next: state.next } : state;
  const items = action.type === 'add' ? [action] : action.items;
  if (!items.length) return state;
  // Only the last CONSOLE_CAP of a batch can survive; skip building the rest (a 10k-log loop is one cheap step).
  const skip = Math.max(0, items.length - CONSOLE_CAP);
  const added = items.slice(skip).map((it, i): ConsoleEntry => ({ id: state.next + skip + i, level: it.level, text: it.args.join(' '), ...it.location }));
  const entries = [...state.entries, ...added];
  const over = Math.max(0, entries.length - CONSOLE_CAP);
  return { entries: over ? entries.slice(over) : entries, next: state.next + items.length, dropped: state.dropped + skip + over };
}

/**
 * C4 review: batches console messages and flushes them once per animation frame, so a tight
 * logging loop costs one render per frame instead of one per message.
 */
export function createConsoleBatcher(flush: (items: ConsoleInput[]) => void, schedule: (cb: () => void) => unknown = (cb) => requestAnimationFrame(cb)) {
  let queue: ConsoleInput[] = [];
  let pending = false;
  const run = () => { pending = false; const items = queue; queue = []; if (items.length) flush(items); };
  return {
    push(item: ConsoleInput) { queue.push(item); if (!pending) { pending = true; schedule(run); } },
    /** Drops anything queued (e.g. on clear or reload). */
    reset() { queue = []; },
    flushNow: run,
  };
}

export type ConsoleFilter = 'all' | 'error' | 'warn' | 'info' | 'log';
export const filterConsole = (entries: readonly ConsoleEntry[], filter: ConsoleFilter) =>
  filter === 'all' ? entries : entries.filter((e) => (filter === 'error' ? e.level === 'error' || e.level === 'uncaught' : e.level === filter));
