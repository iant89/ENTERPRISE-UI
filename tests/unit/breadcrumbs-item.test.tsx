import { createRef } from 'react';
import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Breadcrumbs, BreadcrumbsItem } from '../../src';
import { renderWithTheme } from '../utils';

describe('BreadcrumbsItem', () => {
  it('renders a labelled native link and allows navigation to be cancelled', async () => {
    const onClick = vi.fn((event) => event.preventDefault());
    const ref = createRef<HTMLLIElement>();
    const { user } = renderWithTheme(<nav aria-label="Path"><ol><BreadcrumbsItem ref={ref} href="/orders" target="_blank" aria-label="Orders in new tab" separator onClick={onClick}>Orders</BreadcrumbsItem></ol></nav>);
    const link = screen.getByRole('link', { name: 'Orders in new tab' });
    expect(link).toHaveAttribute('href', '/orders');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(ref.current).toContainElement(link);
    await user.click(link);
    expect(onClick).toHaveBeenCalledOnce();
    expect(onClick.mock.calls[0][0].defaultPrevented).toBe(true);
  });
  it('renders the current page as text or an explicitly actionable button', async () => {
    const onClick = vi.fn();
    const { user, rerender } = renderWithTheme(<ol><BreadcrumbsItem current href="/current">Current</BreadcrumbsItem></ol>);
    expect(screen.getByText('Current')).toHaveAttribute('aria-current', 'page');
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    rerender(<ol><BreadcrumbsItem current onClick={onClick}>Current</BreadcrumbsItem></ol>);
    await user.click(screen.getByRole('button', { name: 'Current' }));
    expect(onClick).toHaveBeenCalledOnce();
  });
  it('renders a non-actionable step without making a dead button', () => {
    renderWithTheme(<ol><BreadcrumbsItem>Section</BreadcrumbsItem></ol>);
    expect(screen.getByText('Section').tagName).toBe('SPAN');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

describe('Breadcrumbs integration', () => {
  it('preserves accessible names, link targets and handlers in the overflow menu', async () => {
    const onClick = vi.fn((event) => event.preventDefault());
    const { user } = renderWithTheme(<Breadcrumbs maxItems={3} overflowMenuLabel="Earlier steps" overflowTriggerLabel={(count) => `${count} hidden`} items={[
      { label: 'Home', href: '/' }, { label: 'Orders', href: '/orders', target: '_blank', ariaLabel: 'Orders in new tab', onClick },
      { label: 'Drafts', href: '/drafts' }, { label: 'Current' },
    ]} />);
    await user.click(screen.getByRole('button', { name: '2 hidden' }));
    const menu = await screen.findByRole('menu', { name: 'Earlier steps' });
    const link = screen.getByRole('menuitem', { name: 'Orders in new tab' });
    expect(menu).toContainElement(link);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    await user.click(link);
    expect(onClick).toHaveBeenCalledOnce();
    expect(onClick.mock.calls[0][0].defaultPrevented).toBe(true);
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });
  it('clamps low maxItems and keeps the root and current item', async () => {
    const { user } = renderWithTheme(<Breadcrumbs maxItems={1} items={[{ label: 'Root', href: '/' }, { label: 'One', href: '#one' }, { label: 'Two', href: '#two' }, { label: 'Here' }]} />);
    expect(screen.getByRole('link', { name: 'Root' })).toBeInTheDocument();
    expect(screen.getByText('Here')).toHaveAttribute('aria-current', 'page');
    await user.click(screen.getByRole('button', { name: 'Show 2 more' }));
    expect(await screen.findByRole('menuitem', { name: 'One' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Two' })).toBeInTheDocument();
  });
});
