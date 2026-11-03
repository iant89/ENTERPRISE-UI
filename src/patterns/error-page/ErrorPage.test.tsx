import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../../tests/utils';
import { ErrorPage } from './ErrorPage';

describe('ErrorPage', () => {
  it('explains the error with a heading, code and copyable reference', async () => {
    const { container } = renderWithTheme(<ErrorPage variant="serverError" reference="req-7f3a91" actions={<a href="/">Go to home page</a>} />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Something went wrong (error 500)');
    expect(screen.getByText('req-7f3a91')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy reference' })).toBeInTheDocument();
    expect(await axeViolations(container)).toEqual([]);
  });

  it('localizes variants and can render inside a page', () => {
    renderWithTheme(<ErrorPage variant="forbidden" standalone={false} labels={{ variants: { forbidden: { title: 'Kein Zugriff' } } }} />);
    expect(screen.queryByRole('main')).toBeNull();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Kein Zugriff');
  });
});
