/** Undo/redo history for the page code. Visual edits and editor typing share one timeline. */
export interface History {
  past: string[];
  present: string;
  future: string[];
  /** Typing in the editor within this window is grouped into one undo step. */
  lastSource?: string;
  lastTime?: number;
}

export const LIMIT = 200;
const GROUP_MS = 1000;

export const createHistory = (code: string): History => ({ past: [], present: code, future: [] });

/** Records a new state. `source: 'editor'` coalesces rapid typing. */
export function commit(history: History, code: string, source: 'visual' | 'editor' | 'load' = 'visual', now = Date.now()): History {
  if (code === history.present) return history;
  if (source === 'editor' && history.lastSource === 'editor' && now - (history.lastTime ?? 0) < GROUP_MS && history.past.length) {
    return { ...history, present: code, future: [], lastTime: now };
  }
  return { past: [...history.past, history.present].slice(-LIMIT), present: code, future: [], lastSource: source, lastTime: now };
}

export function undo(history: History): History {
  if (!history.past.length) return history;
  return { past: history.past.slice(0, -1), present: history.past.at(-1)!, future: [history.present, ...history.future] };
}

export function redo(history: History): History {
  if (!history.future.length) return history;
  return { past: [...history.past, history.present], present: history.future[0], future: history.future.slice(1) };
}
