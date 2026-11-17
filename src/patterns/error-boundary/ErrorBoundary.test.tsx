import { describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import { screen } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../../tests/utils';
import { ErrorBoundary, isChunkLoadError } from './ErrorBoundary';

function Bomb({ message = 'boom' }: { message?: string }): never {
  throw new Error(message);
}

function Flaky({ fail }: { fail: { current: boolean } }) {
  if (fail.current) throw new Error('flaky');
  return <p>Content is back</p>;
}

// React logs caught render errors to console.error; keep the test output clean.
const quiet = () => vi.spyOn(console, 'error').mockImplementation(() => {});

describe('ErrorBoundary', () => {
  it('renders its children when nothing throws', () => {
    renderWithTheme(<ErrorBoundary><p>Fine</p></ErrorBoundary>);
    expect(screen.getByText('Fine')).toBeInTheDocument();
  });

  it('shows the default fallback, reports the error and renders again on Try again', async () => {
    const spy = quiet();
    const onError = vi.fn();
    const onReset = vi.fn();
    const fail = { current: true };
    const { user, container } = renderWithTheme(
      <div>
        <p>Shell</p>
        <ErrorBoundary onError={onError} onReset={onReset}><Flaky fail={fail} /></ErrorBoundary>
      </div>,
    );
    expect(screen.getByText('Shell')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'This part could not be displayed' })).toBeInTheDocument();
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'flaky' }), expect.objectContaining({ componentStack: expect.any(String) }));
    expect(await axeViolations(container)).toEqual([]);
    fail.current = false;
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(screen.getByText('Content is back')).toBeInTheDocument();
    expect(onReset).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });

  it('clears the error when resetKey changes', async () => {
    const spy = quiet();
    function Routes() {
      const [path, setPath] = useState('/broken');
      return (
        <>
          <button onClick={() => setPath('/home')}>Home</button>
          <ErrorBoundary resetKey={path}>{path === '/broken' ? <Bomb /> : <p>Home page</p>}</ErrorBoundary>
        </>
      );
    }
    const { user } = renderWithTheme(<Routes />);
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Home' }));
    expect(screen.getByText('Home page')).toBeInTheDocument();
    spy.mockRestore();
  });

  it('accepts a fallback element or a render function, and localized labels', async () => {
    const spy = quiet();
    const { unmount } = renderWithTheme(<ErrorBoundary fallback={<p>Custom fallback</p>}><Bomb /></ErrorBoundary>);
    expect(screen.getByText('Custom fallback')).toBeInTheDocument();
    unmount();
    const fallback = vi.fn(({ error }: { error: Error }) => <p>Failed: {error.message}</p>);
    const second = renderWithTheme(<ErrorBoundary fallback={fallback}><Bomb message="bad data" /></ErrorBoundary>);
    expect(screen.getByText('Failed: bad data')).toBeInTheDocument();
    expect(fallback).toHaveBeenCalledWith(expect.objectContaining({ reset: expect.any(Function) }));
    second.unmount();
    renderWithTheme(<ErrorBoundary labels={{ title: 'Fehler', retry: 'Erneut versuchen' }} headingLevel={3}><Bomb /></ErrorBoundary>);
    expect(screen.getByRole('heading', { level: 3, name: 'Fehler' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Erneut versuchen' })).toBeInTheDocument();
    spy.mockRestore();
  });

  it('offers only a reload when a lazily loaded module could not be fetched', () => {
    const spy = quiet();
    renderWithTheme(<ErrorBoundary><Bomb message="Failed to fetch dynamically imported module: /app/page-1a2b.js" /></ErrorBoundary>);
    expect(screen.getByRole('heading', { name: 'Reload to continue' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reload page' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull();
    spy.mockRestore();
  });

  it('recognizes load failures in each browser', () => {
    expect(isChunkLoadError(new TypeError('Failed to fetch dynamically imported module: https://x/a.js'))).toBe(true); // Chrome
    expect(isChunkLoadError(new TypeError('error loading dynamically imported module'))).toBe(true); // Firefox
    expect(isChunkLoadError(new TypeError('Importing a module script failed.'))).toBe(true); // Safari
    expect(isChunkLoadError(new Error('Loading chunk 42 failed.'))).toBe(true); // webpack
    expect(isChunkLoadError(new Error('Cannot read properties of undefined'))).toBe(false);
    expect(isChunkLoadError(undefined)).toBe(false);
  });
});
