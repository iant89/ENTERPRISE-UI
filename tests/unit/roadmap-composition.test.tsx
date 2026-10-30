import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  Calendar, CalendarDate, CalendarDateRange, ComboBox, ComboBoxItem, ComboBoxItemGroup, List, ListItemGroup, ListItemStandard,
  Menu, MenuItem, MenuSeparator, Option, OptionGroup,
  Select, SpecialCalendarDate, StepInput,
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

describe('step input', () => {
  it('steps a numeric value from the buttons', async () => {
    const onChange = vi.fn();
    const { user } = renderWithTheme(<StepInput label="Quantity" defaultValue={1} min={0} max={3} onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Increase' }));
    expect(onChange).toHaveBeenCalledWith(2);
    expect(screen.getByRole('spinbutton', { name: 'Quantity' })).toHaveValue('2');
  });
});
