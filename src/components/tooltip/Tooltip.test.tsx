import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { Info } from 'lucide-react';
import { renderWithTheme } from '../../../tests/utils';
import { Tooltip } from './Tooltip';
import { IconButton } from '../icon-button';
import { Popover } from '../popover';
import { Button } from '../button';
import { MessageStrip } from '../message-strip';
import { ProgressBar } from '../progress-bar';
import { ThemeProvider } from '../../themes';
import { render } from '@testing-library/react';

describe('Tooltip', () => {
  it('shows on focus, describes the trigger and hides on Escape', async () => {
    const { user } = renderWithTheme(
      <Tooltip content="More information">
        <IconButton icon={<Info />} label="Info" hideTitle />
      </Tooltip>,
    );
    await user.tab();
    const button = screen.getByRole('button', { name: 'Info' });
    expect(button).toHaveFocus();
    expect(screen.getByRole('tooltip')).toHaveTextContent('More information');
    expect(button).toHaveAccessibleDescription('More information');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});

describe('Popover', () => {
  it('opens a labelled dialog and closes on Escape, restoring focus', async () => {
    const { user } = renderWithTheme(
      <Popover title="Filters" trigger={<Button>Open</Button>}>
        <Button>Apply</Button>
      </Popover>,
    );
    const trigger = screen.getByRole('button', { name: 'Open' });
    await user.click(trigger);
    expect(screen.getByRole('dialog', { name: 'Filters' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});

describe('MessageStrip & ProgressBar', () => {
  it('MessageStrip prefixes the tone for screen readers and can be dismissed', async () => {
    const { user } = renderWithTheme(<MessageStrip tone="warning" dismissible>Budget nearly used</MessageStrip>);
    expect(screen.getByText('Warning:')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Dismiss message' }));
    expect(screen.queryByText('Budget nearly used')).not.toBeInTheDocument();
  });

  it('ProgressBar exposes value semantics', () => {
    renderWithTheme(<ProgressBar label="Upload" value={40} />);
    const bar = screen.getByRole('progressbar', { name: 'Upload' });
    expect(bar).toHaveAttribute('aria-valuenow', '40');
    expect(bar).toHaveAttribute('aria-valuetext', '40%');
  });
});

describe('ThemeProvider', () => {
  it('applies theme and density attributes', () => {
    const { container } = render(
      <ThemeProvider theme="dark" density="compact">
        x
      </ThemeProvider>,
    );
    const root = container.firstElementChild!;
    expect(root).toHaveAttribute('data-eui-theme', 'dark');
    expect(root).toHaveAttribute('data-eui-density', 'compact');
  });
});
