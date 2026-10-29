import { Package } from 'lucide-react';
import { Avatar, Stack } from '@enterprise-ui/react';

export const title = 'Avatars';
export const description = 'Initials and colour derive from the name. Square avatars represent objects; presence dots show availability.';

export default function AvatarBasic() {
  return (
    <Stack gap={4}>
      <Stack direction="horizontal" gap={3} align="center">
        <Avatar name="Ada Lovelace" size="xs" />
        <Avatar name="Grace Hopper" size="sm" presence="online" />
        <Avatar name="Alan Turing" presence="busy" />
        <Avatar name="Katherine Johnson" size="lg" presence="away" />
        <Avatar name="Margaret Hamilton" size="xl" />
      </Stack>
      <Stack direction="horizontal" gap={3} align="center">
        <Avatar name="Contoso Ltd" shape="square" />
        <Avatar icon={<Package />} shape="square" accent={3} aria-label="Product" />
        <Avatar name="Broken image" src="/does-not-exist.png" />
      </Stack>
    </Stack>
  );
}
