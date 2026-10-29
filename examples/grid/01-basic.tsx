import { Grid, GridItem } from '@enterprise-ui/react';

export const title = 'Responsive grid';
export const description = '`columns` accepts a number or per-breakpoint values (sm ≥ 600px, md ≥ 1024px, lg ≥ 1440px). GridItem can span columns.';

const cell = { background: 'var(--eui-color-surface)', border: '1px solid var(--eui-color-border)', borderRadius: 6, padding: 16, textAlign: 'center' as const };

export default function GridBasic() {
  return (
    <Grid columns={{ base: 1, sm: 2, md: 4 }} gap={4}>
      <GridItem span={2}><div style={cell}>span 2</div></GridItem>
      <div style={cell}>1</div>
      <div style={cell}>2</div>
      <div style={cell}>3</div>
      <div style={cell}>4</div>
      <GridItem span="full"><div style={cell}>full width</div></GridItem>
    </Grid>
  );
}
