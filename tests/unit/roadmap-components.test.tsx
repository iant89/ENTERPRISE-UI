import { act, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BusyIndicator, Button, ButtonBadge, CalendarLegend, CalendarLegendItem, Card, CardHeader, Carousel, ColorPalette, ColorPaletteItem, ColorPalettePopover, ColorPicker } from '../../src';
import { renderWithTheme } from '../utils';

describe('BusyIndicator', () => {
  it('delays the status, cancels pending timers and leaves content usable', () => {
    vi.useFakeTimers();
    try {
      const { rerender } = renderWithTheme(<BusyIndicator active delay={1000} text="Refreshing"><button>Cancel</button></BusyIndicator>);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled();
      expect(screen.getByRole('button', { name: 'Cancel' }).parentElement).toHaveAttribute('aria-busy', 'true');
      act(() => vi.advanceTimersByTime(1000));
      expect(screen.getByRole('status')).toHaveTextContent('Refreshing');
      rerender(<BusyIndicator active={false} delay={1000}><button>Cancel</button></BusyIndicator>);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
      act(() => vi.advanceTimersByTime(2000));
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    } finally { vi.useRealTimers(); }
  });
});
describe('ButtonBadge', () => {
  it('is decorative inside a named button in dot and text modes', () => {
    const { rerender } = renderWithTheme(<Button aria-label="Inbox, 3 new" badge={<ButtonBadge design="overlay" text="3" />}>Inbox</Button>);
    expect(screen.getByRole('button', { name: 'Inbox, 3 new' })).toContainElement(screen.getByText('3'));
    expect(screen.getByText('3')).toHaveAttribute('aria-hidden', 'true');
    rerender(<Button badge={<ButtonBadge />}>Inbox</Button>);
    expect(screen.getByRole('button', { name: 'Inbox' })).toBeInTheDocument();
  });
});
describe('CalendarLegend and CalendarLegendItem', () => {
  it('renders a named list with textual, decorative color keys', () => {
    renderWithTheme(<CalendarLegend aria-label="Date types"><CalendarLegendItem text="Holiday" tone="error" /><CalendarLegendItem text="Available" /></CalendarLegend>);
    expect(screen.getByRole('list', { name: 'Date types' })).toContainElement(screen.getByText('Holiday'));
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('Holiday').previousElementSibling).toHaveAttribute('aria-hidden', 'true');
  });
});
describe('CardHeader', () => {
  it('separates title activation from actions', async () => {
    const press = vi.fn(); const action = vi.fn();
    const { user } = renderWithTheme(<Card header={<CardHeader title="Orders" subtitle="Recent" onPress={press} actions={<button onClick={action}>Edit</button>} />}>Content</Card>);
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    expect(action).toHaveBeenCalledOnce(); expect(press).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Orders' }));
    expect(press).toHaveBeenCalledOnce();
    expect(screen.getByRole('heading', { name: 'Orders' })).toBeInTheDocument();
  });
});
describe('Carousel', () => {
  const items = [{ id: 'one', content: 'First' }, { id: 'two', content: 'Second' }];
  it('navigates manually and only exposes the active slide', async () => {
    const changed = vi.fn(); const { user } = renderWithTheme(<Carousel aria-label="Highlights" items={items} onPageChange={changed} />);
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(changed).toHaveBeenCalledWith(1); expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.queryByText('First')).not.toBeInTheDocument(); expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });
  it('respects controlled page and handles an empty collection', async () => {
    const changed = vi.fn(); const { user, rerender } = renderWithTheme(<Carousel aria-label="Highlights" items={items} page={0} onPageChange={changed} />);
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(changed).toHaveBeenCalledWith(1); expect(screen.getByText('First')).toBeInTheDocument();
    rerender(<Carousel aria-label="Highlights" items={[]} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
describe('ColorPalette and ColorPaletteItem', () => {
  it('selects labelled colors and respects disabled options', async () => {
    const change = vi.fn(); const { user } = renderWithTheme(<ColorPalette aria-label="Colors" colors={[{ color: 'red', label: 'Red' }, { color: 'blue', label: 'Blue', disabled: true }]} onChange={change} />);
    await user.click(screen.getByRole('button', { name: 'Red' }));
    expect(screen.getByRole('button', { name: 'Red' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: 'Blue' })); expect(change).toHaveBeenCalledTimes(1);
  });
  it('keeps controlled selection and allows independent items', async () => {
    const change = vi.fn(); const { user, rerender } = renderWithTheme(<ColorPalette aria-label="Colors" value="red" colors={[{ color: 'red', label: 'Red' }, { color: 'blue', label: 'Blue' }]} onChange={change} />);
    await user.click(screen.getByRole('button', { name: 'Blue' }));
    expect(change).toHaveBeenCalledWith('blue'); expect(screen.getByRole('button', { name: 'Red' })).toHaveAttribute('aria-pressed', 'true');
    rerender(<ColorPaletteItem color="white" label="White" selected />);
    expect(screen.getByRole('button', { name: 'White' })).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('ColorPicker', () => {
  it('exposes a labelled native color input and emits browser color changes', async () => {
    const onChange = vi.fn(); const { fireEvent } = await import('@testing-library/react');
    renderWithTheme(<><label htmlFor="color">Color</label><ColorPicker id="color" value="#000000" onChange={onChange} /></>);
    const input = screen.getByLabelText('Color');
    fireEvent.change(input, { target: { value: '#abcdef' } });
    expect(onChange).toHaveBeenCalledWith('#abcdef');
    expect(input).toHaveValue('#000000');
  });
});
describe('ColorPalettePopover', () => {
  it('opens, selects a color and closes', async () => {
    const onChange = vi.fn();
    const { user } = renderWithTheme(<ColorPalettePopover aria-label="Colors" trigger={<Button>Choose</Button>} colors={[{ color: 'red', label: 'Red' }, { color: 'blue', label: 'Blue' }]} onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Choose' }));
    expect(await screen.findByRole('dialog', { name: 'Colors' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Blue' }));
    expect(onChange).toHaveBeenCalledWith('blue');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Choose' })).toHaveFocus();
  });
});
