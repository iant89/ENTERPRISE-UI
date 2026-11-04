import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRef } from 'react';
import { act, fireEvent, screen } from '@testing-library/react';
import { renderWithTheme, axeViolations } from '../../../tests/utils';
import { Lightbox, LightboxImage } from './Lightbox';

afterEach(() => vi.useRealTimers());

const loadImage = () => fireEvent.load(screen.getByRole('img', { name: 'Pump P-100' }));

describe('Lightbox', () => {
  it('shows the image, title and subtitle in a modal dialog', () => {
    renderWithTheme(<Lightbox open onClose={() => {}} src="/pump.jpg" title="Pump P-100" subtitle="Hall 3, line B" />);
    const dialog = screen.getByRole('dialog', { name: 'Pump P-100' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveTextContent('Hall 3, line B');
    expect(screen.getByRole('img', { name: 'Pump P-100' })).toHaveAttribute('src', '/pump.jpg');
  });

  it('does not open without an image URL', () => {
    renderWithTheme(<Lightbox open onClose={() => {}} src="" title="Pump P-100" />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it.each([
    ['the Close button', async (user: ReturnType<typeof renderWithTheme>['user']) => user.click(screen.getByRole('button', { name: 'Close' }))],
    ['Escape', async (user: ReturnType<typeof renderWithTheme>['user']) => user.keyboard('{Escape}')],
    ['a click outside the container', async (user: ReturnType<typeof renderWithTheme>['user']) => user.click(screen.getByRole('dialog').parentElement!)],
  ])('closes with %s', async (_, act) => {
    const onClose = vi.fn();
    const { user } = renderWithTheme(<Lightbox open onClose={onClose} src="/pump.jpg" title="Pump P-100" />);
    loadImage();
    await act(user);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not close when clicking inside the container', async () => {
    const onClose = vi.fn();
    const { user } = renderWithTheme(<Lightbox open onClose={onClose} src="/pump.jpg" title="Pump P-100" />);
    await user.click(screen.getByRole('heading', { name: 'Pump P-100' }));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('shows a busy indicator only after one second of loading', () => {
    vi.useFakeTimers();
    renderWithTheme(<Lightbox open onClose={() => {}} src="/pump.jpg" title="Pump P-100" />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(1000); });
    expect(screen.getByRole('status')).toHaveTextContent('Loading image');
    act(() => { loadImage(); });
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows an error message when the image fails to load', () => {
    renderWithTheme(<Lightbox open onClose={() => {}} src="/missing.jpg" title="Pump P-100" />);
    fireEvent.error(screen.getByRole('img', { name: 'Pump P-100' }));
    expect(screen.getByRole('heading', { name: 'Image could not be loaded' })).toBeInTheDocument();
  });

  it('shows an error message after ten seconds of loading', () => {
    vi.useFakeTimers();
    renderWithTheme(<Lightbox open onClose={() => {}} src="/slow.jpg" title="Pump P-100" />);
    act(() => { vi.advanceTimersByTime(9999); });
    expect(screen.queryByText('Image could not be loaded')).not.toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(1); });
    expect(screen.getByText('Image could not be loaded')).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { baseElement } = renderWithTheme(<Lightbox open onClose={() => {}} src="/pump.jpg" title="Pump P-100" subtitle="Hall 3" />);
    loadImage();
    expect(await axeViolations(baseElement)).toEqual([]);
  });
});

describe('LightboxImage', () => {
  it('opens the lightbox from the thumbnail, shows a zoom icon and restores focus on close', async () => {
    const ref = createRef<HTMLButtonElement>();
    const { user } = renderWithTheme(<LightboxImage ref={ref} src="/pump.jpg" thumbnailSrc="/pump-thumb.jpg" title="Pump P-100" width={120} />);
    const trigger = screen.getByRole('button', { name: 'Enlarge image: Pump P-100' });
    expect(ref.current).toBe(trigger);
    expect(trigger.querySelector('[data-icon="zoom-in"]')).not.toBeNull();
    expect(trigger.querySelector('img')).toHaveAttribute('src', '/pump-thumb.jpg');
    await user.click(trigger);
    expect(screen.getByRole('dialog', { name: 'Pump P-100' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('renders a plain image and no trigger without src', () => {
    renderWithTheme(<LightboxImage src="" thumbnailSrc="/pump-thumb.jpg" title="Pump P-100" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Pump P-100' })).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = renderWithTheme(<LightboxImage src="/pump.jpg" title="Pump P-100" />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
