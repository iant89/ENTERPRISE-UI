/** Code Studio C4: the Console tab's entries (capped; cleared on each successful reload). */
import type { ConsoleLevel, SourceLocation } from './bridge';

export const CONSOLE_CAP = 500;
export interface ConsoleEntry extends SourceLocation { id: number; level: ConsoleLevel | 'uncaught'; text: string }
export interface ConsoleState { entries: ConsoleEntry[]; next: number; /** Entries dropped because of the cap. */ dropped: number }
export type ConsoleAction = { type: 'add'; level: ConsoleEntry['level']; args: readonly string[]; location: SourceLocation } | { type: 'clear' };

export const EMPTY_CONSOLE: ConsoleState = { entries: [], next: 1, dropped: 0 };

export function consoleReducer(state: ConsoleState, action: ConsoleAction): ConsoleState {
  if (action.type === 'clear') return state.entries.length || state.dropped ? { ...EMPTY_CONSOLE, next: state.next } : state;
  const entry: ConsoleEntry = { id: state.next, level: action.level, text: action.args.join(' '), ...action.location };
  const entries = [...state.entries, entry];
  const over = Math.max(0, entries.length - CONSOLE_CAP);
  return { entries: over ? entries.slice(over) : entries, next: state.next + 1, dropped: state.dropped + over };
}

export type ConsoleFilter = 'all' | 'error' | 'warn' | 'info' | 'log';
export const filterConsole = (entries: readonly ConsoleEntry[], filter: ConsoleFilter) =>
  filter === 'all' ? entries : entries.filter((e) => (filter === 'error' ? e.level === 'error' || e.level === 'uncaught' : e.level === filter));
