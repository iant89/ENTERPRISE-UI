import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithTheme, axeViolations } from '../../tests/utils';
import { Wizard } from './wizard';
import { FilterBar } from './filter-bar';
import { ObjectPage } from './object-page';
import { CommandToolbar } from './command-toolbar';
import { DetailPanel } from './detail-panel';
import { EmptyState } from './empty-state';
import { MasterDetail } from './master-detail';
import { Dashboard, DashboardWidget } from './dashboard';
import { Input } from '../components/input';
import { Select } from '../components/select';
import { Button } from '../components/button';
import { MetricCard } from '../components/metric-card';

describe('Wizard', () => {
  it('validates, moves focus to the step heading and finishes', async () => {
    const onFinish = vi.fn();
    let valid = false;
    const { user } = renderWithTheme(
      <Wizard
        aria-label="Create supplier"
        onFinish={onFinish}
        steps={[
          { id: 'a', title: 'Basics', content: <Input label="Name" />, validate: () => (valid ? true : 'Enter a name') },
          { id: 'b', title: 'Review', content: 'Looks good' },
        ]}
      />,
    );
    expect(screen.getByRole('button', { name: /Step 1: Basics/ })).toHaveAttribute('aria-current', 'step');
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('Enter a name')).toBeInTheDocument();
    valid = true;
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Review' })).toHaveFocus());
    await user.click(screen.getByRole('button', { name: 'Finish' }));
    expect(onFinish).toHaveBeenCalled();
  });
});

describe('FilterBar', () => {
  it('submits on Go and toggles the filter area', async () => {
    const onGo = vi.fn();
    const { user } = renderWithTheme(
      <FilterBar onGo={onGo} onClear={() => {}} activeCount={1} search={<Input aria-label="Search" />}>
        <Select label="Status" options={[{ value: 'open', label: 'Open' }]} />
      </FilterBar>,
    );
    expect(screen.getByRole('search', { name: 'Filters' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Go' }));
    expect(onGo).toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: /Hide filters/ }));
    expect(screen.queryByRole('combobox', { name: 'Status' })).not.toBeInTheDocument();
  });
});

describe('ObjectPage', () => {
  it('renders the header, attributes and anchor navigation', async () => {
    const { container } = renderWithTheme(
      <ObjectPage
        title="Purchase Order 4500012"
        subtitle="Supplier: Acme"
        attributes={[{ label: 'Amount', value: '€ 12,400' }]}
        sections={[
          { id: 'general', title: 'General', content: 'General info' },
          { id: 'items', title: 'Items', content: 'Items' },
        ]}
      />,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Purchase Order 4500012' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Sections' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'General' })).toHaveAttribute('aria-current', 'true');
    expect(screen.getByRole('region', { name: 'Items' })).toBeInTheDocument();
    expect(await axeViolations(container)).toEqual([]);
  });

  it('supports tab navigation', () => {
    renderWithTheme(<ObjectPage title="PO" navigation="tabs" sections={[{ id: 'a', title: 'General', content: 'G' }]} />);
    expect(screen.getByRole('tab', { name: 'General' })).toHaveAttribute('aria-selected', 'true');
  });
});

describe('CommandToolbar', () => {
  it('renders a labelled toolbar with actions', async () => {
    const onClick = vi.fn();
    const { user } = renderWithTheme(<CommandToolbar title="Orders" actions={[{ id: 'add', label: 'Add', onClick }, { id: 'del', label: 'Delete' }]} />);
    const toolbar = screen.getByRole('toolbar', { name: 'Orders' });
    const add = screen.getAllByRole('button', { name: 'Add' }).find((b) => toolbar.contains(b) && !b.closest('[aria-hidden]'))!;
    await user.click(add);
    expect(onClick).toHaveBeenCalled();
    add.focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getAllByRole('button', { name: 'Delete' }).find((b) => !b.closest('[aria-hidden]'))).toHaveFocus();
  });
});

describe('DetailPanel', () => {
  it('is a modal dialog that closes with Escape', async () => {
    const onClose = vi.fn();
    const { user } = renderWithTheme(
      <DetailPanel open title="Order 1001" onClose={onClose}>
        <Button>Approve</Button>
      </DetailPanel>,
    );
    const dialog = screen.getByRole('dialog', { name: 'Order 1001' });
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });
});

describe('EmptyState, MasterDetail and Dashboard', () => {
  it('render accessible structures', async () => {
    const { container } = renderWithTheme(
      <>
        <EmptyState title="No orders yet" description="Create your first order." actions={<Button variant="primary">Create order</Button>} />
        <MasterDetail master={<p>List</p>} detail={<p>Detail</p>} />
        <Dashboard title="Sales">
          <DashboardWidget span={2}>
            <MetricCard title="Revenue" value="1.2" unit="M EUR" trend={{ direction: 'up', value: '+4%' }} />
          </DashboardWidget>
        </Dashboard>
      </>,
    );
    expect(screen.getByRole('heading', { name: 'No orders yet' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Sales' })).toBeInTheDocument();
    expect(screen.getByText('Up')).toBeInTheDocument();
    expect(await axeViolations(container)).toEqual([]);
  });
});
