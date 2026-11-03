import { forwardRef, useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utilities/cx';
import { formatRelativeTime, useNow } from '../../hooks/useRelativeTime';
import { Avatar } from '../avatar';
import { Button } from '../button';
import { MentionInput, type MentionPerson } from '../mention-input';
import styles from './CommentThread.module.css';

export interface Comment {
  id: string;
  author: { id: string; name: string; avatar?: string };
  createdAt: Date | string | number;
  /** Plain text (mentions are kept as typed). */
  body: string;
  /** Shown as "(edited)". */
  edited?: boolean;
  /** One level of replies. */
  replies?: Comment[];
}

export interface CommentThreadLabels {
  reply: string;
  edit: string;
  delete: string;
  save: string;
  cancel: string;
  post: string;
  newComment: string;
  replyTo: (name: string) => string;
  edited: string;
  empty: string;
  replies: (count: number) => string;
}

export interface CommentThreadProps extends Omit<HTMLAttributes<HTMLElement>, 'onSubmit'> {
  /** Accessible name, e.g. "Comments on purchase order 4500017321". */
  label: string;
  /** Top-level comments, oldest first. */
  comments: Comment[];
  /** Id of the signed-in user; their comments get Edit and Delete. */
  currentUserId?: string;
  /** Posts a new comment (`parentId` for replies). Persist and add it to `comments`. */
  onPost?: (body: string, parentId: string | null, mentions: MentionPerson[]) => void | Promise<void>;
  /** Saves an edited comment. */
  onEdit?: (id: string, body: string) => void | Promise<void>;
  /** Deletes a comment. Confirm in the application if needed. */
  onDelete?: (id: string) => void;
  /** People who can be @mentioned in new comments. @default [] */
  people?: MentionPerson[];
  /** Locale for relative times. */
  locale?: string;
  /** Overrides for the built-in strings. */
  labels?: Partial<CommentThreadLabels>;
}

const defaultLabels: CommentThreadLabels = {
  reply: 'Reply',
  edit: 'Edit',
  delete: 'Delete',
  save: 'Save',
  cancel: 'Cancel',
  post: 'Comment',
  newComment: 'Add a comment',
  replyTo: (name) => `Reply to ${name}`,
  edited: '(edited)',
  empty: 'No comments yet.',
  replies: (n) => `${n} ${n === 1 ? 'reply' : 'replies'}`,
};

/** Highlights @mentions of known people in a comment body. */
function renderBody(body: string, people: MentionPerson[]): ReactNode {
  if (!people.length) return body;
  const names = people.map((p) => `@${p.name}`).sort((a, b) => b.length - a.length);
  const pattern = new RegExp(`(${names.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g');
  return body.split(pattern).map((part, i) => (names.includes(part) ? <strong key={i} className={styles.mention}>{part}</strong> : part));
}

/** A discussion on a business object: comments with one level of replies, @mentions, and edit or delete of your own comments. */
export const CommentThread = forwardRef<HTMLElement, CommentThreadProps>(function CommentThread(
  { label, comments, currentUserId, onPost, onEdit, onDelete, people = [], locale, labels: labelOverrides, className, ...rest },
  ref,
) {
  const labels = { ...defaultLabels, ...labelOverrides };
  const now = useNow(30_000);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);

  const renderComment = (c: Comment, depth: number) => {
    const mine = currentUserId !== undefined && c.author.id === currentUserId;
    const date = new Date(c.createdAt);
    return (
      <li key={c.id} className={styles.item}>
        <article className={styles.comment} aria-label={`${c.author.name}, ${formatRelativeTime(date, now, locale)}`}>
          <Avatar name={c.author.name} src={c.author.avatar} size="sm" decorative />
          <div className={styles.main}>
            <header className={styles.meta}>
              <span className={styles.author}>{c.author.name}</span>
              <time dateTime={date.toISOString()} title={date.toLocaleString(locale)} className={styles.time}>
                {formatRelativeTime(date, now, locale)}
              </time>
              {c.edited && <span className={styles.time}>{labels.edited}</span>}
            </header>
            {editing === c.id ? (
              <Composer
                label={labels.edit}
                initial={c.body}
                people={people}
                submitLabel={labels.save}
                cancelLabel={labels.cancel}
                onCancel={() => setEditing(null)}
                onSubmit={async (body) => {
                  await onEdit?.(c.id, body);
                  setEditing(null);
                }}
              />
            ) : (
              <p className={styles.body}>{renderBody(c.body, people)}</p>
            )}
            {editing !== c.id && (
              <div className={styles.actions}>
                {onPost && depth === 0 && (
                  <button type="button" className={styles.action} aria-expanded={replyTo === c.id} onClick={() => setReplyTo(replyTo === c.id ? null : c.id)}>
                    {labels.reply}
                  </button>
                )}
                {mine && onEdit && (
                  <button type="button" className={styles.action} onClick={() => setEditing(c.id)}>
                    {labels.edit}
                  </button>
                )}
                {mine && onDelete && (
                  <button type="button" className={styles.action} onClick={() => onDelete(c.id)}>
                    {labels.delete}
                  </button>
                )}
              </div>
            )}
          </div>
        </article>
        {(c.replies?.length || replyTo === c.id) && (
          <ul className={styles.replies} aria-label={labels.replies(c.replies?.length ?? 0)}>
            {c.replies?.map((r) => renderComment(r, depth + 1))}
            {replyTo === c.id && (
              <li className={styles.item}>
                <Composer
                  label={labels.replyTo(c.author.name)}
                  people={people}
                  submitLabel={labels.reply}
                  cancelLabel={labels.cancel}
                  autoFocus
                  onCancel={() => setReplyTo(null)}
                  onSubmit={async (body, mentions) => {
                    await onPost?.(body, c.id, mentions);
                    setReplyTo(null);
                  }}
                />
              </li>
            )}
          </ul>
        )}
      </li>
    );
  };

  return (
    <section ref={ref} className={cx(styles.thread, className)} aria-label={label} {...rest}>
      {comments.length === 0 ? <p className={styles.empty}>{labels.empty}</p> : <ul className={styles.list}>{comments.map((c) => renderComment(c, 0))}</ul>}
      {onPost && <Composer label={labels.newComment} people={people} submitLabel={labels.post} onSubmit={(body, mentions) => onPost(body, null, mentions)} />}
    </section>
  );
});

function Composer({
  label, initial = '', people, submitLabel, cancelLabel, onSubmit, onCancel, autoFocus,
}: {
  label: string;
  initial?: string;
  people: MentionPerson[];
  submitLabel: string;
  cancelLabel?: string;
  onSubmit: (body: string, mentions: MentionPerson[]) => void | Promise<void>;
  onCancel?: () => void;
  autoFocus?: boolean;
}) {
  const [text, setText] = useState(initial);
  const [mentions, setMentions] = useState<MentionPerson[]>([]);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  // A reply composer opens where the user clicked Reply, so focus moves into it.
  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);
  const submit = async () => {
    if (!text.trim()) return;
    setBusy(true);
    try {
      await onSubmit(text.trim(), mentions);
      setText('');
    } finally {
      setBusy(false);
    }
  };
  return (
    <div
      className={styles.composer}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          void submit();
        } else if (e.key === 'Escape' && onCancel) onCancel();
      }}
    >
      <MentionInput
        ref={inputRef}
        label={label}
        hideLabel
        placeholder={label}
        people={people}
        rows={2}
        value={text}
        onChange={(t, m) => {
          setText(t);
          setMentions(m);
        }}
      />
      <div className={styles.composerActions}>
        {onCancel && (
          <Button size="sm" variant="tertiary" onClick={onCancel}>
            {cancelLabel}
          </Button>
        )}
        <Button size="sm" variant="primary" disabled={!text.trim()} loading={busy} onClick={() => void submit()}>
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}
