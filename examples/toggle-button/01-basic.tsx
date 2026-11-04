import { useState } from 'react';
import { ButtonGroup, Stack, ToggleButton, BoldTextIcon, FavoriteIcon, ItalicTextIcon, UnderlineTextIcon } from '@enterprise-ui/react';

export const title = 'Toggle buttons';
export const description = 'Toggle buttons expose `aria-pressed`. Combine them in an attached ButtonGroup for formatting toolbars.';

export default function ToggleButtonBasic() {
  const [favorite, setFavorite] = useState(false);
  return (
    <Stack direction="horizontal" gap={4} wrap>
      <ToggleButton icon={<FavoriteIcon />} pressed={favorite} onPressedChange={setFavorite}>
        {favorite ? 'Favorite' : 'Add to favorites'}
      </ToggleButton>
      <ButtonGroup attached aria-label="Text formatting">
        <ToggleButton icon={<BoldTextIcon />} aria-label="Bold" defaultPressed />
        <ToggleButton icon={<ItalicTextIcon />} aria-label="Italic" />
        <ToggleButton icon={<UnderlineTextIcon />} aria-label="Underline" />
      </ButtonGroup>
    </Stack>
  );
}
