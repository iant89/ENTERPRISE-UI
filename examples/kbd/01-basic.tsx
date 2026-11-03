import { Kbd } from '@enterprise-ui/react';

export const title = 'Keyboard shortcuts in text';
export const description = '`Mod` shows ⌘ on Apple devices and Ctrl elsewhere. Screen readers hear the keys as words, for example “Control plus K”.';

export default function KbdBasic() {
  return (
    <p style={{ margin: 0, lineHeight: 2 }}>
      Press <Kbd keys="Mod+K" /> to open the command palette, <Kbd keys="?" /> for all shortcuts, or <Kbd keys={['Mod', 'Shift', 'S']} /> to save as draft.
    </p>
  );
}
