import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithTheme, axeViolations } from '../../../tests/utils';
import { FormField } from './FormField';
import { Input } from '../input';
import { TextArea } from '../text-area';
import { NumberInput } from '../number-input';
import { SearchField } from '../search-field';
import { Checkbox } from '../checkbox';
import { Switch } from '../switch';
import { RadioGroup } from '../radio-group';
import { FormGroup } from '../form-group';

describe('form controls', () => {
  it('Input wires label, description and error', () => {
    renderWithTheme(<Input label="Email" description="Work address" error="Enter a valid email" required />);
    const input = screen.getByRole('textbox', { name: /Email/ });
    expect(input).toBeRequired();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Work address Error: Enter a valid email');
  });

  it('FormField provides context to a nested control', () => {
    renderWithTheme(
      <FormField label="Supplier" description="Legal name">
        <Input />
      </FormField>,
    );
    expect(screen.getByRole('textbox', { name: 'Supplier' })).toHaveAccessibleDescription('Legal name');
  });

  it('TextArea shows a character counter', async () => {
    const { user } = renderWithTheme(<TextArea label="Notes" maxLength={20} showCount />);
    await user.type(screen.getByRole('textbox'), 'Hello');
    expect(screen.getByText(/5 \/ 20/)).toBeInTheDocument();
  });

  it('NumberInput steps with the keyboard and clamps', async () => {
    const onChange = vi.fn();
    const { user } = renderWithTheme(<NumberInput label="Quantity" defaultValue={9} min={0} max={10} onChange={onChange} />);
    const input = screen.getByRole('spinbutton', { name: 'Quantity' });
    input.focus();
    await user.keyboard('{ArrowUp}');
    expect(onChange).toHaveBeenLastCalledWith(10);
    await user.keyboard('{ArrowUp}');
    expect(input).toHaveAttribute('aria-valuenow', '10');
    await user.clear(input);
    await user.type(input, '42');
    await user.tab();
    expect(onChange).toHaveBeenLastCalledWith(10);
    expect(input).toHaveValue('10');
  });

  it('SearchField calls onSearch on Enter and clears with Escape', async () => {
    const onSearch = vi.fn();
    const { user } = renderWithTheme(<SearchField onSearch={onSearch} />);
    const box = screen.getByRole('searchbox', { name: 'Search' });
    await user.type(box, 'laptop{Enter}');
    expect(onSearch).toHaveBeenCalledWith('laptop');
    await user.keyboard('{Escape}');
    expect(box).toHaveValue('');
  });

  it('Checkbox supports indeterminate state', async () => {
    const onChange = vi.fn();
    const { user } = renderWithTheme(<Checkbox label="Select all" indeterminate onChange={onChange} />);
    const box = screen.getByRole('checkbox', { name: 'Select all' }) as HTMLInputElement;
    expect(box.indeterminate).toBe(true);
    await user.click(box);
    expect(onChange).toHaveBeenCalledWith(true, expect.anything());
  });

  it('Switch exposes role="switch"', async () => {
    const { user } = renderWithTheme(<Switch label="Notifications" />);
    const sw = screen.getByRole('switch', { name: 'Notifications' });
    await user.click(sw);
    expect(sw).toBeChecked();
  });

  it('RadioGroup is a labelled group with one selection', async () => {
    const onChange = vi.fn();
    const { user } = renderWithTheme(
      <RadioGroup label="Shipping" options={[{ value: 'std', label: 'Standard' }, { value: 'exp', label: 'Express' }]} onChange={onChange} />,
    );
    expect(screen.getByRole('radiogroup', { name: 'Shipping' })).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: 'Express' }));
    expect(onChange).toHaveBeenCalledWith('exp');
  });

  it('a complete form has no axe violations', async () => {
    const { container } = renderWithTheme(
      <FormGroup title="Supplier" columns={2}>
        <Input label="Name" required />
        <Input label="Email" type="email" error="Invalid" />
        <NumberInput label="Rating" />
        <TextArea label="Notes" />
        <Checkbox label="Preferred" />
        <Switch label="Active" />
        <RadioGroup label="Type" options={[{ value: 'a', label: 'A' }]} />
      </FormGroup>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
