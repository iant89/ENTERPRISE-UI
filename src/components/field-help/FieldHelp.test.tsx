import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../../tests/utils';
import { Dialog } from '../dialog';
import { Input } from '../input';
import { Select } from '../select';
import { FieldHelp, WithFieldHelp } from './FieldHelp';

const tip = () => screen.getByRole('tooltip', { hidden: true });

describe('FieldHelp', () => {
  it('is a named button described by its tip, which a click keeps open and a second click closes', async () => {
    const { user, baseElement } = renderWithTheme(
      <Input label="Timeout" endAdornment={<FieldHelp label="Timeout">How long to wait for the provider.</FieldHelp>} />,
    );
    const button = screen.getByRole('button', { name: 'About Timeout' });
    expect(button).toHaveAccessibleDescription('How long to wait for the provider.');
    expect(tip()).not.toBeVisible();
    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(tip()).toBeVisible();
    expect(await axeViolations(baseElement)).toEqual([]);
    await user.click(button);
    expect(tip()).not.toBeVisible();
  });

  it('opens on hover after a short delay and closes when the mouse leaves', async () => {
    const { user } = renderWithTheme(<FieldHelp label="Name" buttonLabel="More about the name">Shown to users.</FieldHelp>);
    const button = screen.getByRole('button', { name: 'More about the name' });
    await user.hover(button);
    expect(tip()).not.toBeVisible();
    await waitFor(() => expect(tip()).toBeVisible());
    await user.unhover(button);
    await waitFor(() => expect(tip()).not.toBeVisible());
  });
  it('opens on keyboard focus, and Escape closes only the tip, not the dialog around it', async () => {
    const onClose = vi.fn();
    const { user } = renderWithTheme(
      <Dialog open onClose={onClose} title="Provider">
        <Input label="Endpoint" endAdornment={<FieldHelp label="Endpoint">The base URL.</FieldHelp>} />
      </Dialog>,
    );
    const button = screen.getByRole('button', { name: 'About Endpoint' });
    await user.click(button);
    expect(tip()).toBeVisible();
    await user.keyboard('{Escape}');
    expect(tip()).not.toBeVisible();
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes on a click elsewhere and when typing starts', async () => {
    const { user } = renderWithTheme(
      <>
        <Input label="Model" endAdornment={<FieldHelp label="Model">The model id.</FieldHelp>} />
        <p>Elsewhere</p>
      </>,
    );
    await user.click(screen.getByRole('button', { name: 'About Model' }));
    expect(tip()).toBeVisible();
    await user.click(screen.getByText('Elsewhere'));
    expect(tip()).not.toBeVisible();
    await user.click(screen.getByRole('button', { name: 'About Model' }));
    await user.type(screen.getByRole('textbox', { name: 'Model' }), 'g');
    expect(tip()).not.toBeVisible();
  });
});

describe('WithFieldHelp', () => {
  it('puts the button beside a control without an end adornment', async () => {
    const { user, container } = renderWithTheme(
      <WithFieldHelp label="Region" help="Where requests are processed." className="extra">
        <Select label="Region" options={[{ value: 'eu', label: 'Europe' }]} />
      </WithFieldHelp>,
    );
    expect(container.querySelector('.extra')).not.toBeNull();
    const button = screen.getByRole('button', { name: 'About Region' });
    expect(button).toHaveAccessibleDescription('Where requests are processed.');
    await user.click(button);
    expect(tip()).toBeVisible();
    expect(await axeViolations(container)).toEqual([]);
  });
});
