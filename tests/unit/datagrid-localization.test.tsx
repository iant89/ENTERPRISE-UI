import { fireEvent, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DataGrid, type DataGridColumn } from '../../src';
import { renderWithTheme } from '../utils';

type Row = { id: string; name: string; state: string };
const data: Row[] = [{ id: 'PO-1', name: 'İSTANBUL', state: 'open' }, { id: 'PO-2', name: 'ANKARA', state: 'closed' }];
const columns: DataGridColumn<Row>[] = [{ id: 'name', header: 'Ad', accessor: 'name' }, { id: 'state', header: 'Durum', accessor: 'state', filterOptions: [{ value: 'open', label: 'Açık' }] }];

describe('DataGrid localization', () => {
  it('translates controls, selection and portaled menus with locale-aware search', async () => {
    const { user } = renderWithTheme(<DataGrid title="Sipariş" dir="rtl" lang="tr" locale="tr" columns={columns} data={data} getRowId={(r) => r.id} getRowLabel={(r) => r.id} selectionMode="multiple" pageSize={1} paginationLabel="Sayfalar" resizableColumns
      messages={{ searchPlaceholder: 'Ara', searchLabel: (title) => `${title} ara`, clearSearch: 'Temizle', filterLabel: (column) => `${column} filtre`, filterValue: (column, value) => `${column} ${value}`, all: 'Tümü', viewSettings: 'Görünüm', columns: 'Sütunlar', rowDensity: 'Yoğunluk', cozy: 'Geniş', compact: 'Dar', condensed: 'Sık', selected: (count) => `${count} seçildi`, clearSelection: 'Seçimi temizle', selectAllPage: 'Sayfayı seç', selectRow: (label) => `Seç ${label}`, columnWidths: 'Genişlikler', columnWidth: (column, width) => `${column} ${width}`, noResults: 'Sonuç yok' }}
      paginationMessages={{ nextPage: 'Sonraki', rowsPerPage: 'Sayfa boyutu' }} />);
    expect(screen.getByRole('checkbox', { name: 'Sayfayı seç' })).toBeInTheDocument();
    await user.click(screen.getByRole('checkbox', { name: 'Seç PO-1' }));
    expect(screen.getByText('1 seçildi')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Genişlikler' }));
    expect(screen.getByLabelText('Ad 160')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Görünüm' }));
    const menu = await screen.findByRole('menu', { name: 'Görünüm' });
    expect(menu).toHaveAttribute('dir', 'rtl'); expect(menu).toHaveAttribute('lang', 'tr');
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('combobox', { name: 'Durum filtre' }));
    const list = screen.getByRole('listbox', { name: 'Durum filtre' });
    expect(list).toHaveAttribute('dir', 'rtl'); expect(list).toHaveAttribute('lang', 'tr');
    await user.keyboard('{Escape}');
    expect(screen.getByRole('navigation', { name: 'Sayfalar' })).toBeInTheDocument();
    const query = screen.getByRole('searchbox', { name: 'Sipariş ara' });
    await user.type(query, 'istanbul');
    expect(screen.getByText('İSTANBUL')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Temizle' })).toBeInTheDocument();
    await user.clear(query); await user.type(query, 'yok');
    expect(screen.getByText('Sonuç yok')).toBeInTheDocument();
  });

  it('keeps server pagination and caller selection label overrides intact', () => {
    const onPageChange = vi.fn();
    renderWithTheme(<DataGrid title="Order" columns={columns} data={data} selectionMode="multiple" selectAllLabel="Custom select" selectRowLabel={(label) => `Custom ${label}`} getRowLabel={(r) => r.id}
      messages={{ selectAllPage: 'Other', selectRow: (label) => `Other ${label}`, stale: 'Eski veriler' }} server={{ page: 1, pageSize: 2, totalItems: 10, filters: {}, onFiltersChange: vi.fn(), onPageChange, onPageSizeChange: vi.fn(), stale: true }} />);
    expect(screen.getByRole('checkbox', { name: 'Custom select' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Custom PO-1' })).toBeInTheDocument();
    expect(screen.getByText('Eski veriler')).toBeInTheDocument();
    fireEvent.click(within(screen.getByRole('navigation')).getByRole('button', { name: 'Next page' }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
