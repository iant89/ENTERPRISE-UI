import { useState } from 'react';
import { Bold, Italic, Star, Underline } from 'lucide-react';
import { ButtonGroup, Stack, ToggleButton } from '@enterprise-ui/react';

export const title = 'Toggle buttons';
export const description = 'Toggle buttons expose `aria-pressed`. Combine them in an attached ButtonGroup for formatting toolbars.';

export default function ToggleButtonBasic() {
  const [favorite, setFavorite] = useState(false);
  return (
    <Stack direction="horizontal" gap={4} wrap>
      <ToggleButton icon={<Star />} pressed={favorite} onPressedChange={setFavorite}>
        {favorite ? 'Favorite' : 'Add to favorites'}
      </ToggleButton>
      <ButtonGroup attached aria-label="Text formatting">
        <ToggleButton icon={<Bold />} aria-label="Bold" defaultPressed />
        <ToggleButton icon={<Italic />} aria-label="Italic" />
        <ToggleButton icon={<Underline />} aria-label="Underline" />
      </ButtonGroup>
    </Stack>
  );
}
