import { useState } from 'react';
import { AvatarGroup, Stack, type AvatarGroupItem } from '@enterprise-ui/react';

export const title = 'Avatar groups';
export const description = 'Related people can be activated together or individually. The host handles overflow.';
const items: AvatarGroupItem[] = [
  { id: 'ada', name: 'Ada Lovelace' }, { id: 'grace', name: 'Grace Hopper' },
  { id: 'alan', name: 'Alan Turing' }, { id: 'katherine', name: 'Katherine Johnson' },
];
export default function AvatarGroupExample() {
  const [message, setMessage] = useState('Choose a person or group.');
  return <Stack gap={4}>
    <AvatarGroup aria-label="Project team" items={items} onGroupPress={() => setMessage('Project team selected')} />
    <AvatarGroup aria-label="Team members" mode="individual" items={items} onItemPress={(item) => setMessage(item.name)} onOverflowPress={(hidden) => setMessage(hidden.map((item) => item.name).join(', '))} />
    <span role="status">{message}</span>
  </Stack>;
}
