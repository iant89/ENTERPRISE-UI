import { Building2, FileText, Package } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge, SearchResultsPage, type SearchResult } from '@enterprise-ui/react';

export const title = 'Global search';
export const description = 'Type facets show hit counts; matches are highlighted. Search for “valve”, “hamburg” or “zzz” to see the empty state.';

const all: SearchResult[] = [
  { id: 's1', type: 'supplier', title: 'Northwind Components GmbH', description: 'Valves and fittings · Hamburg, Germany', href: '#s1', icon: <Building2 />, meta: <Badge tone="success">Released</Badge> },
  { id: 's2', type: 'supplier', title: 'Contoso Industrial', description: 'Pumps and valves · Lyon, France', href: '#s2', icon: <Building2 />, meta: <Badge tone="warning">Blocked</Badge> },
  { id: 'o1', type: 'order', title: 'PO 4500017321', description: 'Valve assembly × 4, pressure sensor × 10 · Northwind', href: '#o1', icon: <FileText /> },
  { id: 'o2', type: 'order', title: 'PO 4500017355', description: 'Hydraulic oil × 200 L · Hamburg plant', href: '#o2', icon: <FileText /> },
  { id: 'm1', type: 'material', title: 'MAT-1001 Valve assembly', description: 'Ball valve DN50, stainless steel', href: '#m1', icon: <Package /> },
];
const types = [{ id: 'supplier', label: 'Suppliers' }, { id: 'order', label: 'Purchase orders' }, { id: 'material', label: 'Materials' }];

export default function SearchResultsBasic() {
  const [query, setQuery] = useState('valve');
  const results = useMemo(() => all.filter((r) => `${r.title} ${r.description}`.toLowerCase().includes(query.toLowerCase())), [query]);
  return <SearchResultsPage query={query} onSearch={setQuery} results={results} types={types} />;
}
