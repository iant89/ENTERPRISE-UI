import { Container } from '@enterprise-ui/react';

export const title = 'Container';
export const description = 'Centres content with a maximum width (sm 640, md 960, lg 1280, xl 1600) and responsive side padding.';

const box = { background: 'var(--eui-color-primary-subtle)', border: '1px dashed var(--eui-color-primary)', padding: 12, borderRadius: 4, margin: '8px 0' };

export default function ContainerBasic() {
  return (
    <>
      <Container size="sm"><div style={box}>size="sm"</div></Container>
      <Container size="md"><div style={box}>size="md"</div></Container>
      <Container size="lg"><div style={box}>size="lg"</div></Container>
    </>
  );
}
