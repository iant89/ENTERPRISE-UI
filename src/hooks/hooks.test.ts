import { describe, expect, it } from 'vitest';
import { computePosition } from './usePosition';
import { getNavigationIndex, findTypeaheadIndex } from '../utilities/keyboard';
import { cx } from '../utilities/cx';
import { getInitials } from '../utilities/format';

describe('computePosition', () => {
  const viewport = { width: 1000, height: 800 };
  it('places below-start by default', () => {
    expect(computePosition({ top: 100, left: 50, width: 80, height: 30 }, { width: 200, height: 100 }, { placement: 'bottom-start', offset: 4, viewport })).toEqual({
      top: 134,
      left: 50,
      placement: 'bottom-start',
    });
  });
  it('flips to the top when there is no room below', () => {
    const r = computePosition({ top: 750, left: 50, width: 80, height: 30 }, { width: 200, height: 100 }, { placement: 'bottom-start', offset: 4, viewport });
    expect(r.placement).toBe('top-start');
    expect(r.top).toBe(646);
  });
  it('clamps into the viewport horizontally', () => {
    const r = computePosition({ top: 100, left: 950, width: 40, height: 30 }, { width: 200, height: 100 }, { placement: 'bottom-start', offset: 4, viewport });
    expect(r.left).toBe(792);
  });
});

describe('keyboard helpers', () => {
  it('skips disabled entries and wraps', () => {
    const disabled = (i: number) => i === 1;
    expect(getNavigationIndex('ArrowDown', 0, 3, { isDisabled: disabled })).toBe(2);
    expect(getNavigationIndex('ArrowDown', 2, 3, { isDisabled: disabled })).toBe(0);
    expect(getNavigationIndex('ArrowUp', 0, 3, { loop: false })).toBe(0);
    expect(getNavigationIndex('End', 0, 3)).toBe(2);
    expect(getNavigationIndex('x', 0, 3)).toBeNull();
    expect(getNavigationIndex('ArrowRight', 0, 3, { orientation: 'horizontal', rtl: true })).toBe(2);
  });
  it('finds type-ahead matches after the current index', () => {
    expect(findTypeaheadIndex(['Apple', 'Banana', 'Avocado'], 'a', 0)).toBe(2);
    expect(findTypeaheadIndex(['Apple', 'Banana'], 'z', 0)).toBe(-1);
  });
});

describe('utilities', () => {
  it('cx joins truthy classes', () => expect(cx('a', false, ['b', null, 'c'], undefined, 0, true)).toBe('a b c'));
  it('getInitials', () => {
    expect(getInitials('Ada Lovelace')).toBe('AL');
    expect(getInitials('Maria José da Silva')).toBe('MS');
    expect(getInitials('sap')).toBe('SA');
  });
});
