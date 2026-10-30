import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DateTimePicker, ExpandableText, Form, FormItem, Icon, Input, InputIcon, Label, Link, Panel, RatingIndicator } from '../../src';
import { renderWithTheme } from '../utils';

describe('DateTimePicker', () => {
  it('labels a native local date-time input and emits its value', () => {
    const changed = vi.fn();
    renderWithTheme(<DateTimePicker label="Appointment" onChange={changed} min="2026-01-01T00:00" />);
    const input = screen.getByLabelText('Appointment');
    expect(input).toHaveAttribute('type', 'datetime-local');
    fireEvent.change(input, { target: { value: '2026-10-30T09:30' } });
    expect(changed.mock.calls[0][0]).toBe('2026-10-30T09:30');
    expect(input).toHaveAttribute('min', '2026-01-01T00:00');
  });
});
describe('ExpandableText', () => {
  it('truncates code points, expands and collapses by keyboard', async () => {
    const { user } = renderWithTheme(<ExpandableText text="😀abc" maxCharacters={2} />);
    expect(screen.getByText('😀a…')).toBeInTheDocument();
    await user.tab(); await user.keyboard('{Enter}');
    expect(screen.getByText('😀abc')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Show less' })).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard('{Enter}'); expect(screen.getByText('😀a…')).toBeInTheDocument();
  });
  it('supports controlled state and avoids a button for short text', async () => {
    const changed = vi.fn(); const { user, rerender } = renderWithTheme(<ExpandableText text="Long text" maxCharacters={2} expanded={false} onExpandedChange={changed} />);
    await user.click(screen.getByRole('button')); expect(changed).toHaveBeenCalledWith(true); expect(screen.getByText('Lo…')).toBeInTheDocument();
    rerender(<ExpandableText text="Short" maxCharacters={10} />); expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
describe('Form and FormItem', () => {
  it('submits a native form and links item label, error and input', async () => {
    const submit = vi.fn((event) => event.preventDefault());
    const { user } = renderWithTheme(<Form aria-label="Order" onSubmit={submit}><FormItem label="Reference" error="Required"><Input /></FormItem><button>Save</button></Form>);
    const input = screen.getByLabelText('Reference'); expect(input).toHaveAttribute('aria-invalid', 'true'); expect(input).toHaveAccessibleDescription('Error: Required');
    await user.click(screen.getByRole('button', { name: 'Save' })); expect(submit).toHaveBeenCalledOnce();
  });
});
describe('Icon', () => {
  it('exposes informative icons and hides decorative ones', () => {
    const { rerender } = renderWithTheme(<Icon label="Alert"><svg /></Icon>);
    expect(screen.getByRole('img', { name: 'Alert' })).toBeInTheDocument();
    rerender(<Icon><svg /></Icon>); expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
describe('InputIcon', () => {
  it('is a labelled keyboard-operable input action', async () => {
    const onClick = vi.fn(); const { user } = renderWithTheme(<Input label="Search terms" endAdornment={<InputIcon label="Search" icon={<svg />} onClick={onClick} />} />);
    await user.tab(); await user.tab(); expect(screen.getByRole('button', { name: 'Search' })).toHaveFocus();
    await user.keyboard('{Enter}'); expect(onClick).toHaveBeenCalledOnce();
  });
});
describe('Label', () => {
  it('connects to a required input', () => {
    renderWithTheme(<><Label htmlFor="account" required>Account</Label><Input id="account" required /></>);
    expect(screen.getByRole('textbox', { name: 'Account' })).toBeRequired();
  });
});
describe('Link', () => {
  it('preserves destination and secures blank targets', () => {
    renderWithTheme(<Link href="/orders" target="_blank">Orders</Link>);
    expect(screen.getByRole('link', { name: 'Orders' })).toHaveAttribute('href', '/orders');
    expect(screen.getByRole('link')).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
describe('Panel', () => {
  it('discloses content and supports controlled state', async () => {
    const changed = vi.fn(); const { user, rerender } = renderWithTheme(<Panel title="Details" expanded onExpandedChange={changed}>Body</Panel>);
    await user.click(screen.getByRole('button', { name: 'Details' })); expect(changed).toHaveBeenCalledWith(false);
    expect(screen.getByText('Body')).toBeVisible();
    rerender(<Panel title="Details" expanded={false}>Body</Panel>); expect(screen.getByText('Body')).not.toBeVisible();
    expect(screen.getByRole('button', { name: 'Details' })).toHaveAttribute('aria-expanded', 'false');
  });
  it('keeps fixed content visible without a disclosure control', () => {
    renderWithTheme(<Panel title="Details" fixed expanded={false}>Body</Panel>); expect(screen.getByText('Body')).toBeVisible(); expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
describe('RatingIndicator', () => {
  it('selects a native radio and emits a value', async () => {
    const changed = vi.fn(); const { user } = renderWithTheme(<RatingIndicator label="Rating" onChange={changed} />);
    await user.click(screen.getByRole('radio', { name: '3 of 5' }));
    expect(changed).toHaveBeenCalledWith(3); expect(screen.getByRole('radio', { name: '3 of 5' })).toBeChecked();
  });
  it('renders read-only values and disables editing', () => {
    const { rerender } = renderWithTheme(<RatingIndicator label="Rating" value={3} readOnly />);
    expect(screen.getByRole('img', { name: 'Rating: 3 of 5' })).toBeInTheDocument();
    rerender(<RatingIndicator label="Rating" disabled />); expect(screen.getByRole('radio', { name: '1 of 5' })).toBeDisabled();
  });
});
