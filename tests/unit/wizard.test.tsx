import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Wizard, type WizardStep } from '../../src/patterns/wizard';

const steps: WizardStep[] = [
  { id: 'one', title: 'First', content: 'First content' },
  { id: 'two', title: 'Second', content: 'Second content' },
];

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

describe('Wizard reliability', () => {
  it('rejects empty or duplicate step IDs and empty steps', () => {
    expect(() => render(<Wizard steps={[]} onFinish={() => {}} />)).toThrow('at least one step');
    expect(() => render(<Wizard steps={[steps[0], steps[0]]} onFinish={() => {}} />)).toThrow('non-empty and unique');
    expect(() => render(<Wizard steps={[{ ...steps[0], id: ' ' }]} onFinish={() => {}} />)).toThrow('non-empty and unique');
  });

  it('clamps an invalid index when steps shrink', () => {
    const { rerender } = render(<Wizard steps={steps} defaultStep={1} onFinish={() => {}} />);
    rerender(<Wizard steps={steps.slice(0, 1)} defaultStep={1} onFinish={() => {}} />);
    expect(screen.getByRole('heading', { name: 'First' })).toBeInTheDocument();
    expect(screen.getByText('Step 1 of 1')).toBeInTheDocument();
  });

  it('locks navigation and prevents duplicate validation and finish calls', async () => {
    const validation = deferred<true>();
    const finish = deferred<void>();
    const validate = vi.fn(() => validation.promise);
    const onFinish = vi.fn(() => finish.promise);
    render(<Wizard steps={[{ ...steps[0], validate }]} onFinish={onFinish} onCancel={() => {}} />);
    const button = screen.getByRole('button', { name: 'Finish' });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(validate).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    await act(async () => validation.resolve(true));
    expect(onFinish).toHaveBeenCalledTimes(1);
    fireEvent.click(button);
    expect(onFinish).toHaveBeenCalledTimes(1);
    await act(async () => finish.resolve());
    expect(button).toBeEnabled();
  });

  it('shows rejected operations and allows retry', async () => {
    const onFinish = vi.fn().mockRejectedValueOnce(new Error('Save failed')).mockResolvedValueOnce(undefined);
    render(<Wizard steps={[steps[0]]} onFinish={onFinish} />);
    fireEvent.click(screen.getByRole('button', { name: 'Finish' }));
    expect(await screen.findByText('Save failed')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Finish' }));
    await act(async () => {});
    expect(onFinish).toHaveBeenCalledTimes(2);
    expect(screen.queryByText('Save failed')).not.toBeInTheDocument();
  });

  it('ignores validation results after the controlled step changes', async () => {
    const validation = deferred<true>();
    const onStepChange = vi.fn();
    const configured = [{ ...steps[0], validate: () => validation.promise }, steps[1]];
    const { rerender } = render(<Wizard steps={configured} step={0} onStepChange={onStepChange} onFinish={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    rerender(<Wizard steps={configured} step={1} onStepChange={onStepChange} onFinish={() => {}} />);
    await act(async () => validation.resolve(true));
    expect(onStepChange).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: 'Second' })).toBeInTheDocument();
  });
});
