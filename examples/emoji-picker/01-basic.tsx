import { useRef, useState } from 'react';
import { EmojiPicker, TextArea, insertTextAtCursor } from '@enterprise-ui/react';

export const title = 'Emoji in a message';
export const description = 'The "+" beside the field opens a searchable grid; the chosen emoji goes in at the caret, and the picker stays open for more. Escape closes only the picker.';

export default function EmojiPickerExample() {
  const [message, setMessage] = useState('Maintenance tonight from 22:00 UTC.');
  const field = useRef<HTMLTextAreaElement>(null);
  const insert = (emoji: string) => {
    const next = insertTextAtCursor(field.current, message, emoji);
    setMessage(next.value);
    requestAnimationFrame(() => {
      field.current?.focus();
      field.current?.setSelectionRange(next.caret, next.caret);
    });
  };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 28rem) auto', gap: 4, alignItems: 'end' }}>
      <TextArea ref={field} label="Message" value={message} onChange={(e) => setMessage(e.target.value)} rows={3} />
      <EmojiPicker onSelect={insert} />
    </div>
  );
}
