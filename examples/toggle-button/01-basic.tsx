import { useState } from 'react';
import { ButtonGroup, Stack, ToggleButton, Icon } from '@enterprise-ui/react';

export const title = 'Toggle buttons';
export const description = 'Toggle buttons expose `aria-pressed`. Combine them in an attached ButtonGroup for formatting toolbars.';

export default function ToggleButtonBasic() {
  const [favorite, setFavorite] = useState(false);
  return (
    <Stack direction="horizontal" gap={4} wrap>
      <ToggleButton icon={<Icon name="favorite" />} pressed={favorite} onPressedChange={setFavorite}>
        {favorite ? 'Favorite' : 'Add to favorites'}
      </ToggleButton>
      <ButtonGroup attached aria-label="Text formatting">
        <ToggleButton icon={<Icon name="bold-text" />} aria-label="Bold" defaultPressed />
        <ToggleButton icon={<Icon name="italic-text" />} aria-label="Italic" />
        <ToggleButton icon={<Icon name="underline-text" />} aria-label="Underline" />
      </ButtonGroup>
    </Stack>
  );
}
