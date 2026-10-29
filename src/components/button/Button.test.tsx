import { describe, expect, it, vi } from 'vitest';
import { createRef } from 'react';
import { Plus } from 'lucide-react';
import { renderWithTheme, axeViolations } from '../../../tests/utils';
import { screen } from '@testing-library/react';
import { Button } from './Button';
import { IconButton } from '../icon-button';
import { ToggleButton } from '../toggle-button';
import { ButtonGroup } from '../button-group';
import { SplitButton } from '../split-button';

describe('Button', () => {
  it('renders a native button with type="button" by default', () => {
    renderWithTheme(<Button>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toHaveAttribute('type', 'button');
  });

  it('forwards refs and calls onClick', async () => {
    const ref = createRef<HTMLButtonElement>();
    const onClick = vi.fn();
    const { user } = renderWithTheme(<Button ref={ref} onClick={onClick}>Go</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not fire onClick while loading and exposes aria-busy', async () => {
    const onClick = vi.fn();
    const { user } = renderWithTheme(<Button loading onClick={onClick}>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toHaveAttribute('aria-busy', 'true');
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('applies variant classes', () => {
    renderWithTheme(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole('button').className).toMatch(/destructive/);
  });

  it('is disabled when disabled', () => {
    renderWithTheme(<Button disabled>Save</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('has no axe violations', async () => {
    const { container } = renderWithTheme(
      <ButtonGroup aria-label="Actions">
        <Button variant="primary">Save</Button>
        <IconButton icon={<Plus />} label="Add" />
      </ButtonGroup>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe('IconButton', () => {
  it('uses label as the accessible name', () => {
    renderWithTheme(<IconButton icon={<Plus />} label="Add item" />);
    expect(screen.getByRole('button', { name: 'Add item' })).toBeInTheDocument();
  });
});

describe('ToggleButton', () => {
  it('toggles aria-pressed', async () => {
    const onPressedChange = vi.fn();
    const { user } = renderWithTheme(<ToggleButton onPressedChange={onPressedChange}>Bold</ToggleButton>);
    const button = screen.getByRole('button', { name: 'Bold' });
    expect(button).toHaveAttribute('aria-pressed', 'false');
    await user.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(onPressedChange).toHaveBeenCalledWith(true);
  });
});

describe('SplitButton', () => {
  it('runs the default action and opens the menu', async () => {
    const onClick = vi.fn();
    const onAction = vi.fn();
    const { user } = renderWithTheme(
      <SplitButton onClick={onClick} onAction={onAction} items={[{ id: 'draft', label: 'Save as draft' }]}>
        Save
      </SplitButton>,
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onClick).toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'More options' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Save as draft' }));
    expect(onAction).toHaveBeenCalledWith('draft');
  });
});
