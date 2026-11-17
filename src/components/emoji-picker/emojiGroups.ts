export interface EmojiItem {
  /** The emoji itself. */
  emoji: string;
  /** Words to search by; the first ones are also its accessible name and tooltip. */
  name: string;
}

export interface EmojiGroup {
  /** Heading of the group. */
  name: string;
  emoji: EmojiItem[];
}

const group = (name: string, list: [string, string][]): EmojiGroup => ({ name, emoji: list.map(([emoji, n]) => ({ emoji, name: n })) });

/**
 * A curated set for business and operational messages (status, work, time, messages,
 * faces), not the whole Unicode list. Pass your own `groups` for a different set.
 */
export const DEFAULT_EMOJI_GROUPS: readonly EmojiGroup[] = [
  group('Status', [['⚠️', 'warning'], ['❗', 'exclamation'], ['❓', 'question'], ['✅', 'check done'], ['❌', 'cross failed'], ['🚫', 'blocked'], ['⛔', 'no entry'], ['🔴', 'red circle down'], ['🟠', 'orange circle'], ['🟡', 'yellow circle'], ['🟢', 'green circle up'], ['🔵', 'blue circle'], ['ℹ️', 'information'], ['🆕', 'new'], ['🆗', 'ok'], ['🔥', 'fire hot incident']]),
  group('Work', [['🛠️', 'tools maintenance'], ['🔧', 'wrench fix'], ['⚙️', 'gear settings'], ['🚀', 'rocket launch release'], ['📦', 'package'], ['🧪', 'test experiment'], ['🐛', 'bug'], ['🔒', 'lock security'], ['🔑', 'key'], ['🛡️', 'shield'], ['📈', 'chart up'], ['📉', 'chart down'], ['💾', 'save disk'], ['🖥️', 'computer server'], ['☁️', 'cloud'], ['🔌', 'plug connection']]),
  group('Time', [['⏰', 'alarm clock'], ['⏳', 'hourglass waiting'], ['⌛', 'hourglass done'], ['🕒', 'clock'], ['📅', 'calendar date'], ['🗓️', 'calendar schedule'], ['⏱️', 'stopwatch'], ['🔁', 'repeat'], ['⏸️', 'pause'], ['▶️', 'play start']]),
  group('Messages', [['📢', 'loudspeaker announcement'], ['📣', 'megaphone'], ['💡', 'idea tip'], ['📌', 'pin'], ['📝', 'note memo'], ['📖', 'book docs'], ['🔗', 'link'], ['📬', 'mailbox'], ['💬', 'speech chat'], ['👉', 'point right'], ['⭐', 'star'], ['❤️', 'heart'], ['👍', 'thumbs up'], ['🙏', 'thanks please'], ['👋', 'wave hello'], ['🎉', 'party celebration']]),
  group('Faces', [['🙂', 'smile'], ['😀', 'grin'], ['😉', 'wink'], ['😅', 'sweat relief'], ['🤔', 'thinking'], ['😮', 'surprised'], ['😬', 'grimace'], ['😴', 'sleep'], ['🤖', 'robot ai'], ['👀', 'eyes look']]),
];

/** Inserts `text` at the caret (or over the selection) of a text field, or at the end without one; returns the new value and caret. */
export function insertTextAtCursor(field: HTMLTextAreaElement | HTMLInputElement | null | undefined, value: string, text: string): { value: string; caret: number } {
  const start = field?.selectionStart ?? value.length;
  const end = field?.selectionEnd ?? value.length;
  return { value: value.slice(0, start) + text + value.slice(end), caret: start + text.length };
}
