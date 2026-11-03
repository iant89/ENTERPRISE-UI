import { describe, expect, it } from 'vitest';
import { createRef } from 'react';
import { axeViolations, renderWithTheme } from '../../../tests/utils';
import { DescriptionList } from './DescriptionList';

describe('DescriptionList', () => {
  it('renders dt/dd pairs, empty text and spans', async () => {
    const ref = createRef<HTMLDListElement>();
    const { container } = renderWithTheme(
      <DescriptionList ref={ref} columns={3} emptyText="Not set" items={[{ term: 'Supplier', description: 'Northwind' }, { term: 'Terms', description: '' }, { term: 'Notes', description: 'Long', span: 'full' }]} />,
    );
    expect(ref.current?.tagName).toBe('DL');
    expect([...container.querySelectorAll('dt')].map((d) => d.textContent)).toEqual(['Supplier', 'Terms', 'Notes']);
    expect(container.querySelectorAll('dd')[1]).toHaveTextContent('Not set');
    expect((container.querySelectorAll('dl > div')[2] as HTMLElement).style.getPropertyValue('--eui-dl-span')).toBe('3');
    expect(await axeViolations(container)).toEqual([]);
  });
});
