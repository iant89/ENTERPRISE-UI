import { describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import { act, screen, waitFor } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../../tests/utils';
import { Tour, type TourStep } from './Tour';

const STEPS: TourStep[] = [
  { id: 'menu', target: '#menu', title: 'The menu', content: 'Every page is here.' },
  { id: 'search', target: () => document.getElementById('search'), title: 'Search', content: 'Find anything.', placement: 'right' },
  { id: 'done', title: 'All set', content: 'Replay the tour from the help menu.' },
];

function Page({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav id="menu">Menu</nav>
      <input id="search" aria-label="Search" />
      {children}
    </div>
  );
}

const noop = () => {};

describe('Tour', () => {
  it('shows a step as a modal dialog named by its title, with progress, and moves focus to it', async () => {
    const { baseElement } = renderWithTheme(<Page><Tour steps={STEPS} open onFinish={noop} onSkip={noop} /></Page>);
    const dialog = await screen.findByRole('dialog', { name: 'The menu' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleDescription('Every page is here.');
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('heading', { name: 'The menu' })).toHaveFocus());
    expect(baseElement.querySelector('[data-eui-tour-spotlight]')).not.toBeNull();
    expect(screen.queryByRole('button', { name: 'Back' })).toBeNull();
    expect(await axeViolations(baseElement, { ignoreStructure: true })).toEqual([]);
  });

  it('Next, Back and Done move through the steps; Done finishes', async () => {
    const onFinish = vi.fn();
    const onStepChange = vi.fn();
    const { user } = renderWithTheme(<Page><Tour steps={STEPS} open onFinish={onFinish} onSkip={noop} onStepChange={onStepChange} /></Page>);
    await user.click(await screen.findByRole('button', { name: 'Next' }));
    expect(await screen.findByRole('dialog', { name: 'Search' })).toBeInTheDocument();
    expect(onStepChange).toHaveBeenLastCalledWith(1);
    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(await screen.findByRole('dialog', { name: 'The menu' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(await screen.findByRole('button', { name: 'Next' }));
    expect(await screen.findByRole('dialog', { name: 'All set' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Skip tour' })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Done' }));
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it('Skip, the close button and Escape skip with the current step', async () => {
    const onSkip = vi.fn();
    const { user } = renderWithTheme(<Page><Tour steps={STEPS} open defaultStep={1} onFinish={noop} onSkip={onSkip} /></Page>);
    await user.click(await screen.findByRole('button', { name: 'Skip tour' }));
    await user.click(screen.getByRole('button', { name: 'Close tour' }));
    expect(screen.getByRole('button', { name: 'Close tour' })).toHaveFocus(); // Escape works from anywhere in the callout
    await user.keyboard('{Escape}');
    expect(onSkip.mock.calls).toEqual([[1], [1], [1]]);
  });

  it('Left and Right arrows move between steps', async () => {
    const { user } = renderWithTheme(<Page><Tour steps={STEPS} open onFinish={noop} onSkip={noop} /></Page>);
    await waitFor(() => expect(screen.getByRole('heading', { name: 'The menu' })).toHaveFocus());
    await user.keyboard('{ArrowRight}');
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Search' })).toHaveFocus());
    await user.keyboard('{ArrowLeft}');
    expect(await screen.findByRole('dialog', { name: 'The menu' })).toBeInTheDocument();
  });

  it('waits for a target that appears later, such as after navigating', async () => {
    function Late() {
      const [shown, setShown] = useState(false);
      setTimeout(() => setShown(true), 50);
      return shown ? <div id="late">Late</div> : null;
    }
    const { baseElement } = renderWithTheme(
      <Page><Late /><Tour steps={[{ id: 'late', target: '#late', title: 'Arrived', content: 'Here.' }]} open onFinish={noop} onSkip={noop} /></Page>,
    );
    expect(await screen.findByRole('dialog', { name: 'Arrived' })).toBeInTheDocument();
    await waitFor(() => expect(baseElement.querySelector('[data-eui-tour-spotlight]')).not.toBeNull());
  });

  it('centres a step whose target never appears, dimming the whole page', async () => {
    const { baseElement } = renderWithTheme(
      <Tour steps={[{ id: 'gone', target: '#missing', title: 'Still here', content: 'No target.' }]} open targetTimeout={30} onFinish={noop} onSkip={noop} />,
    );
    const dialog = await screen.findByRole('dialog', { name: 'Still here' });
    await waitFor(() => expect(dialog.style.visibility).toBe(''));
    expect(baseElement.querySelector('[data-eui-tour-spotlight]')).toBeNull();
    expect(baseElement.querySelector('[data-eui-tour-backdrop]')?.className).toMatch(/dimmed/);
  });

  it('centres a step whose target exists but is off screen (a collapsed off-canvas menu)', async () => {
    const { baseElement } = renderWithTheme(
      <div>
        <a id="offcanvas" href="/x" ref={(el) => { if (el) el.getBoundingClientRect = () => ({ top: 10, left: -300, right: -60, bottom: 40, width: 240, height: 30, x: -300, y: 10, toJSON: () => ({}) }); }}>Hidden link</a>
        <Tour steps={[{ id: 'nav', target: '#offcanvas', title: 'Navigation', content: 'Every page.' }]} open onFinish={noop} onSkip={noop} />
      </div>,
    );
    const dialog = await screen.findByRole('dialog', { name: 'Navigation' });
    await waitFor(() => expect(dialog.style.visibility).toBe(''));
    expect(baseElement.querySelector('[data-eui-tour-spotlight]')).toBeNull();
    expect(baseElement.querySelector('[data-eui-tour-backdrop]')?.className).toMatch(/dimmed/);
  });

  it('can be controlled, localized and closed', async () => {
    function Controlled() {
      const [step, setStep] = useState(2);
      const [open, setOpen] = useState(true);
      return (
        <Page>
          <button onClick={() => setStep(0)}>Restart</button>
          <Tour steps={STEPS} open={open} step={step} onStepChange={setStep} onFinish={() => setOpen(false)} onSkip={noop}
            labels={{ finish: 'Fertig', progress: (c, t) => `${c}/${t}` }} />
        </Page>
      );
    }
    const { user } = renderWithTheme(<Controlled />);
    expect(await screen.findByText('3/3')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Fertig' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('starts again from the first step every time it opens (uncontrolled)', async () => {
    function Reopen() {
      const [open, setOpen] = useState(true);
      return (
        <Page>
          <button onClick={() => setOpen(true)}>Start</button>
          <Tour steps={STEPS} open={open} onFinish={noop} onSkip={() => setOpen(false)} />
        </Page>
      );
    }
    const { user } = renderWithTheme(<Reopen />);
    await user.click(await screen.findByRole('button', { name: 'Next' }));
    await user.click(await screen.findByRole('button', { name: 'Skip tour' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Start' }));
    expect(await screen.findByRole('dialog', { name: 'The menu' })).toBeInTheDocument();
  });

  it('keeps the page behind it from being clicked', async () => {
    const clicked = vi.fn();
    renderWithTheme(<div><button onClick={clicked}>Behind</button><Tour steps={STEPS.slice(2)} open onFinish={noop} onSkip={noop} /></div>);
    await screen.findByRole('dialog', { name: 'All set' });
    const backdrop = document.querySelector('[data-eui-tour-backdrop]') as HTMLElement;
    await act(async () => backdrop.click());
    expect(clicked).not.toHaveBeenCalled();
  });

  it('refuses empty steps and duplicate ids', () => {
    const quiet = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderWithTheme(<Tour steps={[]} open onFinish={noop} onSkip={noop} />)).toThrow('at least one step');
    expect(() => renderWithTheme(<Tour steps={[STEPS[0]!, STEPS[0]!]} open onFinish={noop} onSkip={noop} />)).toThrow('unique');
    quiet.mockRestore();
  });
});
