import { createRef } from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Bar } from '../../src';
import { renderWithTheme } from '../utils';

describe('Bar', () => {
  it('renders start, center and end in DOM and tab order without imposing a toolbar role', async () => {
    const ref = createRef<HTMLDivElement>();
    const { user } = renderWithTheme(<Bar ref={ref} startContent={<button>Back</button>} endContent={<button>Save</button>}><span>Title</span></Bar>);
    expect(ref.current).toContainElement(screen.getByText('Title'));
    expect(screen.queryByRole('toolbar')).not.toBeInTheDocument();
    await user.tab(); expect(screen.getByRole('button', { name: 'Back' })).toHaveFocus();
    await user.tab(); expect(screen.getByRole('button', { name: 'Save' })).toHaveFocus();
  });
  it('allows a caller-supplied landmark and accessible name', () => {
    renderWithTheme(<Bar design="footer" role="region" aria-label="Order actions" endContent="Actions" />);
    expect(screen.getByRole('region', { name: 'Order actions' })).toHaveTextContent('Actions');
  });
});
