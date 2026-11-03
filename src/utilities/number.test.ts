import { describe, expect, it } from 'vitest';
import { currencyDigits, formatLocaleNumber, parseLocaleNumber } from './number';

describe('locale numbers', () => {
  it.each([
    ['1,234.56', 'en-US', 1234.56],
    ['1234.56', 'en-US', 1234.56],
    ['1.234,56', 'de-DE', 1234.56],
    ['1234,5', 'de-DE', 1234.5],
    ['1 234,5', 'fr-FR', 1234.5],
    ['1 234,5', 'fr-FR', 1234.5],
    ["1'234.5", 'de-CH', 1234.5],
    ['−12.5', 'en-US', -12.5],
    ['(1,000)', 'en-US', -1000],
    ['12-', 'en-US', -12],
    ['', 'en-US', null],
  ])('parses %s in %s', (text, locale, expected) => {
    expect(parseLocaleNumber(text, locale)).toBe(expected);
  });

  it.each([
    ['1.5', 'de-DE'],
    ['1,5', 'en-US'],
    ['12,34,5', 'en-US'],
    ['abc', 'en-US'],
    ['1.2.3', 'en-US'],
  ])('rejects ambiguous or invalid %s in %s instead of guessing', (text, locale) => {
    expect(parseLocaleNumber(text, locale)).toBeNaN();
  });

  it('formats with grouping and currency digits', () => {
    expect(formatLocaleNumber(1234.5, 'de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })).toBe('1.234,50');
    expect(formatLocaleNumber(null)).toBe('');
    expect(currencyDigits('JPY')).toBe(0);
    expect(currencyDigits('KWD')).toBe(3);
    expect(currencyDigits('EUR')).toBe(2);
  });
});
