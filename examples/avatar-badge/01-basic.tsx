import { Avatar, AvatarBadge, Stack, AcceptIcon, EditIcon, ShieldIcon } from '@enterprise-ui/react';

export const title = 'Avatar badges';
export const description = 'Use an icon and optional semantic tone; describe meaningful badges on the avatar.';

export default function AvatarBadgeBasic() {
  return <Stack direction="horizontal" gap={4} align="center">
    <Avatar name="Ada Lovelace" size="lg" badge={<AvatarBadge icon={<EditIcon />} />} badgeLabel="Editable profile" />
    <Avatar name="Grace Hopper" size="lg" badge={<AvatarBadge icon={<AcceptIcon />} tone="success" />} badgeLabel="Verified" />
    <Avatar name="Alan Turing" size="lg" presence="online" badge={<AvatarBadge icon={<ShieldIcon />} tone="warning" />} badgeLabel="Review required" />
  </Stack>;
}
