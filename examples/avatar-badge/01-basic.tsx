import { Check, Pencil, ShieldAlert } from 'lucide-react';
import { Avatar, AvatarBadge, Stack } from '@enterprise-ui/react';

export const title = 'Avatar badges';
export const description = 'Use an icon and optional semantic tone; describe meaningful badges on the avatar.';

export default function AvatarBadgeBasic() {
  return <Stack direction="horizontal" gap={4} align="center">
    <Avatar name="Ada Lovelace" size="lg" badge={<AvatarBadge icon={<Pencil />} />} badgeLabel="Editable profile" />
    <Avatar name="Grace Hopper" size="lg" badge={<AvatarBadge icon={<Check />} tone="success" />} badgeLabel="Verified" />
    <Avatar name="Alan Turing" size="lg" presence="online" badge={<AvatarBadge icon={<ShieldAlert />} tone="warning" />} badgeLabel="Review required" />
  </Stack>;
}
