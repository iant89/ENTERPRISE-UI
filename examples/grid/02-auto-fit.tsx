import { Card, Grid } from '@enterprise-ui/react';

export const title = 'Auto-fit columns';
export const description = '`minChildWidth` fits as many columns as possible — useful for card galleries.';

export default function GridAutoFit() {
  return (
    <Grid minChildWidth="12rem" gap={3}>
      {['Berlin', 'Lyon', 'Chicago', 'Osaka', 'São Paulo', 'Sydney'].map((city) => (
        <Card key={city} title={city} subtitle="Distribution center" flat />
      ))}
    </Grid>
  );
}
