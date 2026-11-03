import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../../tests/utils';
import { DocumentViewer } from './DocumentViewer';

describe('DocumentViewer', () => {
  it('shows PDFs in a titled frame with download and open links', () => {
    const { container } = renderWithTheme(<DocumentViewer title="Invoice 90004410.pdf" src="/files/invoice.pdf" />);
    expect(container.querySelector('iframe')).toHaveAttribute('title', 'Invoice 90004410.pdf');
    expect(screen.getByRole('link', { name: 'Download' })).toHaveAttribute('download');
    expect(screen.getByRole('link', { name: 'Open in new tab' })).toHaveAttribute('rel', 'noopener noreferrer');
    // axe cannot inspect iframes in jsdom; the PDF frame is checked in the browser suite.
  });

  it('zooms and rotates images', async () => {
    const { user, container } = renderWithTheme(<DocumentViewer title="Delivery note scan.png" src="/scan.png" alt="Scanned delivery note 80001234" />);
    expect(await axeViolations(container)).toEqual([]);
    const img = screen.getByRole('img', { name: 'Scanned delivery note 80001234' });
    await user.click(screen.getByRole('button', { name: 'Zoom in' }));
    expect(img).toHaveStyle({ width: '125%' });
    expect(screen.getByText('125%')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Rotate' }));
    expect(img.style.transform).toBe('rotate(90deg)');
  });
});
