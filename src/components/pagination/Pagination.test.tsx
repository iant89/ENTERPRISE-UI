import { describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import { renderWithTheme } from '../../../tests/utils';
import { Pagination, getPageRange } from './Pagination';
import { Breadcrumbs } from '../breadcrumbs';

describe('getPageRange', () => {
  it('returns all pages when few', () => expect(getPageRange(1, 5)).toEqual([1, 2, 3, 4, 5]));
  it('adds ellipses around the current page', () => expect(getPageRange(10, 20)).toEqual([1, 'ellipsis', 9, 10, 11, 'ellipsis', 20]));
  it('handles edges', () => {
    expect(getPageRange(1, 20)).toEqual([1, 2, 3, 4, 5, 'ellipsis', 20]);
    expect(getPageRange(20, 20)).toEqual([1, 'ellipsis', 16, 17, 18, 19, 20]);
  });
});

describe('Pagination', () => {
  it('marks the current page and navigates', async () => {
    const onPageChange = vi.fn();
    const { user } = renderWithTheme(<Pagination page={2} totalItems={95} pageSize={10} onPageChange={onPageChange} />);
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('11–20 of 95')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onPageChange).toHaveBeenCalledWith(3);
    await user.click(screen.getByRole('button', { name: 'Last page' }));
    expect(onPageChange).toHaveBeenCalledWith(10);
  });
});

describe('Breadcrumbs', () => {
  it('marks the current page and collapses long trails', () => {
    renderWithTheme(
      <Breadcrumbs
        maxItems={3}
        items={[{ label: 'Home', href: '#' }, { label: 'Sales', href: '#s' }, { label: 'Orders', href: '#o' }, { label: 'PO-1001' }]}
      />,
    );
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    expect(screen.getByText('PO-1001')).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Show 2 more' })).toBeInTheDocument();
  });
});

describe('Breadcrumbs collapsed menu', () => {
  it('passes a real event to onClick of hidden items', async () => {
    const onClick = vi.fn((event: React.MouseEvent) => event.preventDefault());
    const { user } = renderWithTheme(
      <Breadcrumbs maxItems={3} items={[{ label: 'Home', href: '#' }, { label: 'Sales', onClick }, { label: 'Orders', href: '#o' }, { label: 'PO-1001' }]} />,
    );
    await user.click(screen.getByRole('button', { name: 'Show 2 more' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Sales' }));
    expect(onClick).toHaveBeenCalledOnce();
    expect(onClick.mock.calls[0][0].defaultPrevented).toBe(true);
  });
});

describe('localized Pagination', () => {
  it('translates navigation and formats display numbers without changing callback values', async () => {
    const change = vi.fn();
    const sizeChange = vi.fn();
    const number = (value: number) => `#${value}`;
    const { user } = renderWithTheme(<Pagination dir="rtl" lang="ar" aria-label="تنقل الصفحات" page={2} totalItems={95} pageSize={10} onPageChange={change} pageSizeOptions={[10, 25]} onPageSizeChange={sizeChange}
      messages={{ summary: (from, to, total) => `${number(from)} إلى ${number(to)} من ${number(total)}`, rowsPerPage: 'صفوف لكل صفحة', firstPage: 'الأولى', previousPage: 'السابقة', nextPage: 'التالية', lastPage: 'الأخيرة', pageLabel: (page) => `صفحة ${number(page)}`, pageNumber: number, compactPage: (page, total) => `${number(page)} من ${number(total)}` }} />);
    expect(screen.getByRole('navigation', { name: 'تنقل الصفحات' })).toHaveAttribute('dir', 'rtl');
    expect(screen.getByText('#11 إلى #20 من #95')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'صفحة #2' })).toHaveAttribute('aria-current', 'page');
    await user.click(screen.getByRole('button', { name: 'التالية' }));
    expect(change).toHaveBeenCalledWith(3);
    await user.click(screen.getByRole('combobox', { name: 'صفوف لكل صفحة' }));
    await user.click(await screen.findByRole('option', { name: '#25' }));
    expect(sizeChange).toHaveBeenCalledWith(25);
  });
});

it('passes localized pagination labels through DataGrid', async () => {
  const { DataGrid } = await import('../data-grid');
  renderWithTheme(<DataGrid title="Orders" data={[{ id: '1', name: 'A' }, { id: '2', name: 'B' }]} getRowId={(row) => row.id}
    columns={[{ id: 'name', header: 'Name', accessor: 'name' }]} pageSize={1}
    paginationLabel="تنقل الطلبات" paginationMessages={{ nextPage: 'التالية', pageLabel: (page) => `صفحة ${page}` }} />);
  const nav = screen.getByRole('navigation', { name: 'تنقل الطلبات' });
  expect(within(nav).getByRole('button', { name: 'التالية' })).toBeInTheDocument();
  expect(within(nav).getByRole('button', { name: 'صفحة 1' })).toHaveAttribute('aria-current', 'page');
});
