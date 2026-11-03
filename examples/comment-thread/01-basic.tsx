import { useState } from 'react';
import { CommentThread, type Comment } from '@enterprise-ui/react';

export const title = 'Discussion on a purchase order';
export const description = 'Reply opens a composer with focus; Ctrl+Enter posts. Type @ to mention someone. Your own comments (Avery) can be edited or deleted.';

const people = [{ id: 'u1', name: 'Avery Lindqvist' }, { id: 'u2', name: 'Kai Moreno' }, { id: 'u3', name: 'Priya Natarajan' }];
const me = people[0];
let n = 10;

export default function CommentThreadBasic() {
  const [comments, setComments] = useState<Comment[]>([
    { id: 'c1', author: people[1], createdAt: Date.now() - 3 * 3_600_000, body: 'The unit price is 8% above last quarter. Can we renegotiate?', replies: [{ id: 'c2', author: me, createdAt: Date.now() - 2 * 3_600_000, body: 'Asked the supplier. @Kai Moreno I will update you tomorrow.' }] },
    { id: 'c3', author: people[2], createdAt: Date.now() - 40 * 60_000, body: 'Please keep the delivery date, line 3 needs the valves by 12 Dec.' },
  ]);
  const post = (body: string, parentId: string | null) => {
    const c: Comment = { id: `c${n++}`, author: me, createdAt: Date.now(), body };
    setComments((all) => (parentId ? all.map((x) => (x.id === parentId ? { ...x, replies: [...(x.replies ?? []), c] } : x)) : [...all, c]));
  };
  const edit = (id: string, body: string) => setComments((all) => all.map((x) => ({ ...(x.id === id ? { ...x, body, edited: true } : x), replies: x.replies?.map((r) => (r.id === id ? { ...r, body, edited: true } : r)) })));
  const remove = (id: string) => setComments((all) => all.filter((x) => x.id !== id).map((x) => ({ ...x, replies: x.replies?.filter((r) => r.id !== id) })));
  return <CommentThread label="Comments on purchase order 4500017321" comments={comments} currentUserId={me.id} people={people} onPost={post} onEdit={edit} onDelete={remove} />;
}
