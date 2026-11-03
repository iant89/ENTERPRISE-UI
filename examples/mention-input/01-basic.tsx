import { useState } from 'react';
import { MentionInput, type MentionPerson } from '@enterprise-ui/react';

export const title = 'Comment with mentions';
export const description = 'Type @ and part of a name. Arrow keys choose, Enter or Tab inserts, Escape closes. The mentioned people are reported so the application can notify them.';

const people: MentionPerson[] = [
  { id: 'u1', name: 'Avery Lindqvist', description: 'Buyer' },
  { id: 'u2', name: 'Kai Moreno', description: 'Controller' },
  { id: 'u3', name: 'Priya Natarajan', description: 'Plant manager' },
  { id: 'u4', name: 'Jordan Okafor', description: 'Quality engineer' },
];

export default function MentionInputBasic() {
  const [mentions, setMentions] = useState<MentionPerson[]>([]);
  return (
    <div style={{ display: 'grid', gap: 8, maxWidth: 520 }}>
      <MentionInput label="Comment" people={people} placeholder="Add a comment. Use @ to mention someone." onChange={(_, m) => setMentions(m)} />
      <p style={{ margin: 0 }}>Will notify: {mentions.map((m) => m.name).join(', ') || 'nobody'}</p>
    </div>
  );
}
