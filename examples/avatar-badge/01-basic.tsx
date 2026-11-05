import { Avatar, AvatarBadge, Stack, Icon } from '@enterprise-ui/react';

export const title = 'Avatar badges';
export const description = 'Use an icon and optional semantic tone; describe meaningful badges on the avatar.';

export default function AvatarBadgeBasic() {
  return <Stack direction="horizontal" gap={4} align="center">
    <Avatar name="Ada Lovelace" size="lg" badge={<AvatarBadge icon={<Icon name="edit" />} />} badgeLabel="Editable profile" />
    <Avatar name="Grace Hopper" size="lg" badge={<AvatarBadge icon={<Icon name="accept" />} tone="success" />} badgeLabel="Verified" />
    <Avatar name="Alan Turing" size="lg" presence="online" badge={<AvatarBadge icon={<Icon name="shield" />} tone="warning" />} badgeLabel="Review required" />
  </Stack>;
}
