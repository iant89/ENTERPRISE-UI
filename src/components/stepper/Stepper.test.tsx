import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../../tests/utils';
import { Stepper } from './Stepper';

const steps = [{ id: 'o', label: 'Ordered' }, { id: 's', label: 'Shipped', status: 'error' as const, description: 'Customs hold' }, { id: 'd', label: 'Delivered' }, { id: 'i', label: 'Invoiced' }];

describe('Stepper', () => {
  it('marks status in text and the current step', async () => {
    const onStepClick = vi.fn();
    const { user, container } = renderWithTheme(<Stepper steps={steps} current={2} onStepClick={onStepClick} />);
    const items = screen.getAllByRole('listitem');
    expect(items.map((li) => li.textContent)).toEqual(['✓Ordered, Completed'.replace('✓', ''), 'ShippedCustoms hold, Has errors', '3Delivered, Current step', '4Invoiced, Not started']);
    expect(items[2]).toHaveAttribute('aria-current', 'step');
    await user.click(screen.getByRole('button', { name: /Ordered/ }));
    expect(onStepClick).toHaveBeenCalledWith(0, steps[0]);
    expect(screen.queryByRole('button', { name: /Invoiced/ })).toBeNull();
    expect(await axeViolations(container)).toEqual([]);
  });
});
