import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Dialog } from '../../components/dialog';
import { useId } from '../../hooks/useId';
import styles from './CommandPalette.module.css';

/** A command or application destination. IDs must be unique and stable. */
export interface PaletteCommand {
  id: string;
  label: string;
  group?: string;
  description?: string;
  keywords?: string[];
  /** Display-only hint; registering the shortcut is the application's responsibility. */
  shortcut?: string;
  /** Hidden when false. This is presentation, not an authorization boundary. */
  permitted?: boolean;
}

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commands: PaletteCommand[];
  /** Called with the selected command; the host performs navigation or the action. */
  onSelect: (command: PaletteCommand) => void;
  /** Most recent command IDs first. Only permitted, currently available IDs are shown. */
  recentIds?: string[];
  /** Enable the global Ctrl/Command+K shortcut. Mount only one shortcut-enabled palette. @default false */
  globalShortcut?: boolean;
  title?: string;
  searchLabel?: string;
  /** Accessible name of the results list. @default "Commands" */
  resultsLabel?: string;
  /** Heading for commands without a group. @default "Commands" */
  defaultGroupLabel?: string;
  /** Heading for recent commands. @default "Recent" */
  recentLabel?: string;
  /** Announced when no commands match. @default "No commands found." */
  emptyMessage?: string;
  /** Accessible close button label. @default "Close dialog" */
  closeLabel?: string;
  /** Valid BCP 47 locale for case-insensitive matching. */
  locale?: string;
  /** Direction and language of the portaled dialog. */
  dir?: 'ltr' | 'rtl' | 'auto';
  lang?: string;
}

/** Search and invoke host-provided commands in a modal, keyboard-first interface. */
export function CommandPalette({ open, onOpenChange, commands, onSelect, recentIds = [], globalShortcut = false, title = 'Command palette', searchLabel = 'Search commands', resultsLabel = 'Commands', defaultGroupLabel = 'Commands', recentLabel = 'Recent', emptyMessage = 'No commands found.', closeLabel, locale, dir, lang }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState<string>();
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId(undefined, 'command-list');

  useEffect(() => {
    if (!globalShortcut) return;
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (!event.defaultPrevented && !event.repeat && (event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        onOpenChange(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [globalShortcut, onOpenChange]);

  useEffect(() => {
    if (!open) { setQuery(''); setActiveId(undefined); }
  }, [open]);

  const permitted = commands.filter((command) => command.permitted !== false);
  const normalized = query.trim().toLocaleLowerCase(locale);
  const matches = permitted.filter((command) => [command.label, command.description, command.group, ...(command.keywords ?? [])].some((value) => value?.toLocaleLowerCase(locale).includes(normalized)));
  const recent = !normalized ? [...new Set(recentIds)].flatMap((id) => {
    const command = matches.find((item) => item.id === id);
    return command ? [command] : [];
  }) : [];
  const groups = new Map<string, PaletteCommand[]>();
  for (const command of matches) {
    if (recent.some((item) => item.id === command.id)) continue;
    const group = command.group || defaultGroupLabel;
    groups.set(group, [...(groups.get(group) ?? []), command]);
  }
  const sections = [...(recent.length ? [{ name: recentLabel, commands: recent }] : []), ...Array.from(groups, ([name, items]) => ({ name, commands: items }))];
  const visible = sections.flatMap((section) => section.commands);
  const activeIndex = Math.max(0, visible.findIndex((item) => item.id === activeId));
  const active = visible[activeIndex];
  const optionId = (index: number) => `${listId}-option-${index}`;

  useEffect(() => {
    if (open && visible.length) document.getElementById(`${listId}-option-${activeIndex}`)?.scrollIntoView?.({ block: 'nearest' });
  }, [open, activeIndex, visible.length, listId]);

  const select = (command: PaletteCommand) => {
    onOpenChange(false);
    onSelect(command);
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!visible.length) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      setActiveId(visible[(activeIndex + direction + visible.length) % visible.length].id);
    } else if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
      event.preventDefault();
      select(active);
    }
  };

  let index = -1;
  return <Dialog open={open} onClose={() => onOpenChange(false)} title={title} initialFocusRef={inputRef} closeLabel={closeLabel} dir={dir} lang={lang}>
    <input ref={inputRef} className={styles.search} role="combobox" aria-label={searchLabel} aria-autocomplete="list" aria-expanded="true" aria-controls={listId} aria-activedescendant={active ? optionId(activeIndex) : undefined} value={query} onChange={(event) => { setQuery(event.target.value); setActiveId(undefined); }} onKeyDown={handleKeyDown} />
    <div id={listId} role="listbox" aria-label={resultsLabel} className={styles.results}>
      {sections.map((section, sectionIndex) => <div key={`${section.name}-${sectionIndex}`} role="group" aria-label={section.name}>
        <div className={styles.heading} aria-hidden="true">{section.name}</div>
        {section.commands.map((command) => {
          index += 1;
          const currentIndex = index;
          return <div id={optionId(currentIndex)} key={command.id} role="option" aria-selected={currentIndex === activeIndex} className={styles.option} onMouseMove={() => setActiveId(command.id)} onMouseDown={(event) => event.preventDefault()} onClick={() => select(command)}>
            <span><span className={styles.label}><bdi>{command.label}</bdi></span>{command.description && <span className={styles.description}><bdi>{command.description}</bdi></span>}</span>
            {command.shortcut && <kbd dir="ltr" className={styles.shortcut}>{command.shortcut}</kbd>}
          </div>;
        })}
      </div>)}
    </div>
    {!visible.length && <p role="status" className={styles.empty}>{emptyMessage}</p>}
  </Dialog>;
}
