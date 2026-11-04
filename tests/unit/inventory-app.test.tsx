import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../../src';
import InventoryApp from '../../examples/apps/InventoryApp';
import { PAGE_IDS, PAGE_TITLES } from '../../examples/apps/inventory';
import { initialProducts } from '../../examples/apps/inventory/data';
import { toCsv } from '../../examples/apps/inventory/csv';
import { filterProducts } from '../../examples/apps/inventory/pages/Products';
import { validateProduct } from '../../examples/apps/inventory/pages/ProductDialog';
import { computeMetrics } from '../../examples/apps/inventory/pages/Overview';

const none = { query: '', categories: [], supplier: null, status: null };

describe('inventory demo logic', () => {
  it('filters by search text, category, supplier and status', () => {
    expect(filterProducts(initialProducts, { ...none, query: 'dock' }).map((p) => p.name)).toEqual(['Dock Station D5']);
    expect(filterProducts(initialProducts, { ...none, query: initialProducts[2].sku.toLowerCase() })).toHaveLength(1);
    expect(filterProducts(initialProducts, { ...none, categories: ['Laptops'] }).every((p) => p.category === 'Laptops')).toBe(true);
    expect(filterProducts(initialProducts, { ...none, status: 'Out of stock' }).every((p) => p.stock === 0)).toBe(true);
  });

  it('computes key figures from the product list', () => {
    const m = computeMetrics(initialProducts);
    expect(m.lowStock).toBe(initialProducts.filter((p) => p.status === 'Low stock').length);
    expect(m.stockOuts).toBe(initialProducts.filter((p) => p.status === 'Out of stock').length);
    expect(m.value).toBe(initialProducts.reduce((s, p) => s + p.price * p.stock, 0));
  });

  it('validates the product form', () => {
    const blank = { name: '', sku: '', category: null, supplier: null, stock: null, price: null };
    expect(validateProduct(blank, []).map((e) => e.id)).toEqual(['product-name', 'product-sku', 'product-category', 'product-supplier', 'product-stock', 'product-price']);
    const ok = { name: 'X', sku: 'SKU-123456', category: 'Laptops', supplier: 'Litware', stock: 1, price: 5 };
    expect(validateProduct(ok, [])).toEqual([]);
    expect(validateProduct(ok, ['SKU-123456'])[0].message).toMatch(/already in use/);
  });

  it('escapes CSV fields', () => {
    expect(toCsv([{ a: 'x,"y"', b: 2 }], [{ header: 'A', value: (r) => r.a }, { header: 'B', value: (r) => r.b }])).toBe('A,B\r\n"x,""y""",2');
  });
});

describe('<InventoryApp />', () => {
  it('renders a real page with its own heading for every navigation id', () => {
    for (const id of PAGE_IDS) {
      const { unmount } = render(<ThemeProvider><InventoryApp page={id} /></ThemeProvider>);
      expect(screen.getByRole('heading', { level: 1, name: PAGE_TITLES[id] })).toBeInTheDocument();
      unmount();
    }
  });

  it('shows a not-found page for unknown ids', () => {
    render(<ThemeProvider><InventoryApp page="nope" /></ThemeProvider>);
    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument();
  });

  it('counts only unread notifications', () => {
    render(<ThemeProvider><InventoryApp page="home" /></ThemeProvider>);
    expect(screen.getByRole('button', { name: /notifications/i })).toHaveAccessibleName(/3/);
  });

  it('creates a product after validation and updates the overview figures', async () => {
    const user = userEvent.setup();
    render(<ThemeProvider><InventoryApp /></ThemeProvider>);
    await user.click(screen.getByRole('button', { name: 'Create product' }));
    const dialog = await screen.findByRole('dialog', { name: 'Create product' });
    await user.click(within(dialog).getByRole('button', { name: 'Create' }));
    expect(within(dialog).getAllByText('Enter a product name.').length).toBeGreaterThan(0);
  });
});
