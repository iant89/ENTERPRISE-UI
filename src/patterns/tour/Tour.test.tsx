import { useRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../../tests/utils';
import { Coachmark, Tour, type TourStep } from './Tour';

function Harness({ onClose = vi.fn(), steps }: { onClose?: (...args: unknown[]) => void; steps?: TourStep[] }) {
  const [open, setOpen] = useState(false);
  const filters = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button onClick={() => setOpen(true)}>Start tour</button>
      <input aria-label="Search" id="search" />
      <button ref={filters}>Filters</button>
      <Tour
        open={open}
        onClose={(...args) => { setOpen(false); onClose(...args); }}
        steps={steps ?? [
          { id: 'welcome', title: 'Welcome', content: 'A quick look around.' },
          { id: 'search', target: '#search', title: 'Search', content: 'Find any order.' },
          { id: 'filters', target: filters, title: 'Filters', content: 'Narrow the list.', placement: 'right' },
        ]}
      />
    </>
  );
}

describe('Tour', () => {
  it('steps through anchored cards with focus in the dialog and returns focus on finish', async () => {
    const onClose = vi.fn();
    const { user, container } = renderWithTheme(<Harness onClose={onClose} />);
    const start = screen.getByRole('button', { name: 'Start tour' });
    await user.click(start);

    const dialog = screen.getByRole('dialog', { name: 'Welcome' });
    expect(dialog).toHaveAccessibleDescription('A quick look around.');
    expect(dialog).toHaveFocus();
    expect(dialog).toHaveTextContent('1 of 3');
    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument();
    expect(await axeViolations(container.ownerDocument.body)).toEqual([]);

    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('dialog', { name: 'Search' })).toHaveFocus();
    // The page stays usable: the dialog is not modal.
    expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-modal');

    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('dialog', { name: 'Filters' })).toHaveTextContent('3 of 3');
    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByRole('dialog', { name: 'Search' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(screen.getByRole('button', { name: 'Finish' }));

    expect(onClose).toHaveBeenCalledWith('finish', 2);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(start).toHaveFocus();
  });

  it('closes with Escape, Skip or the close button and reports the reason and step', async () => {
    const onClose = vi.fn();
    const { user } = renderWithTheme(<Harness onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: 'Start tour' }));
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenLastCalledWith('escape', 0);

    await user.click(screen.getByRole('button', { name: 'Start tour' }));
    await user.click(screen.getByRole('button', { name: 'Skip tour' }));
    expect(onClose).toHaveBeenLastCalledWith('skip', 0);

    await user.click(screen.getByRole('button', { name: 'Start tour' }));
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenLastCalledWith('skip', 0);
  });

  it('centers a step whose target is missing instead of failing', async () => {
    const { user } = renderWithTheme(<Harness steps={[{ id: 'gone', target: '#does-not-exist', title: 'Moved' }]} />);
    await user.click(screen.getByRole('button', { name: 'Start tour' }));
    expect(screen.getByRole('dialog', { name: 'Moved' })).toBeInTheDocument();
    expect(screen.queryByText(/of 1/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Finish' })).toBeInTheDocument();
  });
});

describe('Coachmark', () => {
  it('is a single anchored tip dismissed with its button', async () => {
    const onClose = vi.fn();
    const { user } = renderWithTheme(
      <>
        <button id="export">Export</button>
        <Coachmark target="#export" open onClose={onClose} title="New: export to Excel">Download the filtered list.</Coachmark>
      </>,
    );
    expect(screen.getByRole('dialog', { name: 'New: export to Excel' })).toHaveAccessibleDescription('Download the filtered list.');
    expect(document.querySelector('[data-tour-spotlight]')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Got it' }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
