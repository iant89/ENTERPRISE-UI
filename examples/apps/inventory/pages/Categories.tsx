import { List, Page } from '@enterprise-ui/react';
import { categoryOptions, currency } from '../../../data';
import { useInventory } from '../store';
import { crumbs } from '../crumbs';

export function Categories() {
  const { products, navigate, showProducts } = useInventory();
  return (
    <Page title="Categories" subtitle="Product groups in the catalog. Choose one to see its products." breadcrumbs={crumbs(navigate, ['Home', 'home'], ['Catalog', 'products'], 'Categories')}>
      <List
        aria-label="Categories"
        dividers
        onItemClick={(item) => showProducts({ categories: [item.id] })}
        items={categoryOptions.map(({ value }) => {
          const inCat = products.filter((p) => p.category === value);
          return {
            id: value,
            title: value,
            textValue: value,
            description: `${inCat.length} ${inCat.length === 1 ? 'product' : 'products'}`,
            meta: currency(inCat.reduce((s, p) => s + p.price * p.stock, 0)),
          };
        })}
      />
    </Page>
  );
}
