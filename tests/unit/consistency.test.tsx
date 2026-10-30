import { describe, expect, it } from 'vitest';
import { createRef } from 'react';
import { renderWithTheme } from '../utils';
import { AppBreadcrumbBar, Carousel, CopyButton, DiffViewer, RatingIndicator } from '../../src';

describe('Consistency: refs and className pass-through', () => {
  it('forwards refs and className on Carousel', () => {
    const ref = createRef<HTMLElement>();
    renderWithTheme(<Carousel ref={ref} className="x" aria-label="Slides" items={[{ id: 'a', content: 'A' }]} />);
    expect(ref.current?.tagName).toBe('SECTION');
    expect(ref.current).toHaveClass('x');
  });
  it('forwards refs on RatingIndicator', () => {
    const ref = createRef<HTMLFieldSetElement>();
    renderWithTheme(<RatingIndicator ref={ref} label="Quality" className="x" />);
    expect(ref.current).toBeInstanceOf(HTMLFieldSetElement);
    expect(ref.current).toHaveClass('x');
  });
  it('forwards refs on CopyButton to the button', () => {
    const ref = createRef<HTMLButtonElement>();
    renderWithTheme(<CopyButton ref={ref} value="abc" />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
  it('forwards refs on AppBreadcrumbBar and DiffViewer', () => {
    const bar = createRef<HTMLDivElement>();
    const diff = createRef<HTMLElement>();
    renderWithTheme(<><AppBreadcrumbBar ref={bar} items={[{ label: 'Home', href: '#' }]} /><DiffViewer ref={diff} className="d" changes={[]} /></>);
    expect(bar.current).toBeInstanceOf(HTMLDivElement);
    expect(diff.current).toHaveClass('d');
  });
});
