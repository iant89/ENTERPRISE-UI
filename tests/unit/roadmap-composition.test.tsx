import { fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  Calendar, CalendarDate, CalendarDateRange, ComboBox, ComboBoxItem, ComboBoxItemGroup, List, ListItemGroup, ListItemStandard,
  Menu, MenuItem, MenuSeparator, Option, OptionGroup, RangeSlider, ResponsivePopover, SegmentedButton, SegmentedButtonItem,
  Select, Slider, SpecialCalendarDate, StepInput, Button,
} from '../../src';
import { renderWithTheme } from '../utils';

describe('calendar markers', () => {
  it('marks selected days, ranges and labelled special dates', () => {
    renderWithTheme(
      <Calendar defaultValue={new Date(2026, 9, 15)} locale="en-US">
        <CalendarDate value="2026-10-20" />
        <CalendarDate value="not-a-date" />
        <CalendarDateRange startValue="2026-10-03" endValue="2026-10-01" />
        <SpecialCalendarDate value="2026-10-31" type="warning" label="Month end" />
      </Calendar>,
    );
    expect(screen.getByRole('button', { name: /October 20, 2026/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /October 2, 2026/ })).toHaveAccessibleName(/in selected range/);
    expect(screen.getByRole('button', { name: /October 31, 2026/ })).toHaveAccessibleName(/Month end/);
  });
});

describe('combo box and select items', () => {
  it('selects a grouped combo box item', async () => {
    const onChange = vi.fn();
    const { user } = renderWithTheme(
      <ComboBox label="Country" onChange={onChange}>
        <ComboBoxItemGroup headerText="Europe" headerAccessibleName="European countries">
          <ComboBoxItem label="Germany" value="DE" additionalText="EUR" />
          <ComboBoxItem label="France" value="FR" />
        </ComboBoxItemGroup>
      </ComboBox>,
    );
    await user.click(screen.getByRole('button', { name: 'Show options' }));
    expect(screen.getByText('Europe')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Germany/ })).toHaveTextContent('EUR');
    await user.click(screen.getByRole('option', { name: /Germany/ }));
    expect(onChange).toHaveBeenCalledWith('DE');
  });

  it('selects a grouped option and skips disabled options', async () => {
    const onChange = vi.fn();
    const { user } = renderWithTheme(
      <Select label="Country" onChange={onChange}>
        <OptionGroup headerText="Europe">
          <Option label="Germany" value="DE" disabled />
          <Option label="France" value="FR" />
        </OptionGroup>
      </Select>,
    );
    screen.getByRole('combobox').focus();
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenCalledWith('FR');
  });
});

describe('list and menu composition', () => {
  it('renders grouped list rows and reports clicks', async () => {
    const onItemClick = vi.fn();
    const { user } = renderWithTheme(
      <List aria-label="Materials" onItemClick={onItemClick}>
        <ListItemGroup headerText="Open">
          <ListItemStandard id="pump" text="Pump" highlight="critical" />
        </ListItemGroup>
      </List>,
    );
    expect(screen.getByText('Open')).toBeInTheDocument();
    expect(screen.getByText('Critical')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Pump/ }));
    expect(onItemClick).toHaveBeenCalledWith(expect.objectContaining({ id: 'pump' }));
  });

  it('activates menu items and skips the separator', async () => {
    const onAction = vi.fn();
    const { user } = renderWithTheme(
      <Menu aria-label="Actions" onAction={onAction}>
        <MenuItem id="edit" label="Edit" />
        <MenuSeparator />
        <MenuItem id="delete" label="Delete" />
      </Menu>,
    );
    expect(screen.getByRole('separator')).toBeInTheDocument();
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }));
    expect(onAction).toHaveBeenCalledWith('delete');
  });
});

describe('slider, range and step input', () => {
  it('moves a slider by step and restores the focused value', async () => {
    const onChange = vi.fn();
    const { user } = renderWithTheme(<Slider label="Volume" defaultValue={10} min={0} max={100} step={5} onChange={onChange} />);
    const slider = screen.getByRole('slider', { name: 'Volume' });
    slider.focus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenCalledWith(15);
    await user.keyboard('{Escape}');
    expect(onChange).toHaveBeenLastCalledWith(10);
  });

  it('keeps range handles from crossing and steps the end handle', () => {
    const onChange = vi.fn();
    const view = renderWithTheme(<RangeSlider label="Price" defaultValue={[20, 40]} onChange={onChange} />);
    fireEvent.change(screen.getByRole('slider', { name: 'Range start' }), { target: { value: '90' } });
    expect(onChange).toHaveBeenCalledWith([40, 40]);
    view.unmount();
    const stepped = vi.fn();
    renderWithTheme(<RangeSlider label="Price" defaultValue={[20, 40]} onChange={stepped} />);
    fireEvent.keyDown(screen.getByRole('slider', { name: 'Range end' }), { key: 'ArrowLeft' });
    expect(stepped).toHaveBeenCalledWith([20, 39]);
  });

  it('steps a numeric value from the buttons', async () => {
    const onChange = vi.fn();
    const { user } = renderWithTheme(<StepInput label="Quantity" defaultValue={1} min={0} max={3} onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Increase' }));
    expect(onChange).toHaveBeenCalledWith(2);
    expect(screen.getByRole('spinbutton', { name: 'Quantity' })).toHaveValue('2');
  });
});

describe('segmented button', () => {
  it('selects one item with the keyboard and toggles multiple items', async () => {
    const onChange = vi.fn();
    const { user, rerender } = renderWithTheme(
      <SegmentedButton accessibleName="Period" defaultValue="day" onChange={onChange}>
        <SegmentedButtonItem id="day">Day</SegmentedButtonItem>
        <SegmentedButtonItem id="month" disabled>Month</SegmentedButtonItem>
        <SegmentedButtonItem id="year">Year</SegmentedButtonItem>
      </SegmentedButton>,
    );
    screen.getByRole('radio', { name: 'Day' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenCalledWith('year');
    expect(screen.getByRole('radio', { name: 'Year' })).toHaveAttribute('aria-checked', 'true');
    rerender(
      <SegmentedButton accessibleName="Filters" selectionMode="multiple" defaultValue={['open']}>
        <SegmentedButtonItem id="open">Open</SegmentedButtonItem>
        <SegmentedButtonItem id="closed">Closed</SegmentedButtonItem>
      </SegmentedButton>,
    );
    await user.click(screen.getByRole('button', { name: 'Closed' }));
    expect(screen.getByRole('button', { name: 'Closed' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Open' })).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('responsive popover', () => {
  const original = window.matchMedia;
  afterEach(() => { window.matchMedia = original; });

  it('uses a non-modal popover on a wide viewport and a modal dialog on a narrow one', async () => {
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
    })) as typeof window.matchMedia;
    const { user, unmount } = renderWithTheme(
      <ResponsivePopover trigger={<Button>Order details</Button>} title="Order"><p>Purchase order 4500001234.</p></ResponsivePopover>,
    );
    await user.click(screen.getByRole('button', { name: 'Order details' }));
    expect(screen.getByRole('dialog', { name: 'Order' })).not.toHaveAttribute('aria-modal', 'true');
    unmount();

    window.matchMedia = ((query: string) => ({
      matches: query.includes('max-width'),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
    })) as typeof window.matchMedia;
    renderWithTheme(
      <ResponsivePopover trigger={<Button>Order details</Button>} title="Order"><p>Purchase order 4500001234.</p></ResponsivePopover>,
    );
    await user.click(screen.getByRole('button', { name: 'Order details' }));
    expect(screen.getByRole('dialog', { name: 'Order' })).toHaveAttribute('aria-modal', 'true');
  });
});
