import { useState } from 'react';
import { AuditTrail, type AuditFilters, type AuditRecord } from '@enterprise-ui/react';
// Demo fixture represents records returned by an authoritative audit service.
const records: AuditRecord[] = [{ id: '1', actor: 'Morgan Lee', timestamp: '2026-10-29T14:00:00Z', action: 'Update', source: 'Purchasing API', changes: [{ field: 'Quantity', before: '5', after: '10' }] }];
export default function AuditExample() {
  const [filters, setFilters] = useState<AuditFilters>({ actor: '', action: '', start: '', end: '' });
  const filtered = records.filter((record) => record.actor.toLowerCase().includes(filters.actor.toLowerCase()) && record.action.toLowerCase().includes(filters.action.toLowerCase()) && (!filters.start || record.timestamp.slice(0, 10) >= filters.start) && (!filters.end || record.timestamp.slice(0, 10) <= filters.end));
  return <AuditTrail records={filtered} filters={filters} onFiltersChange={setFilters} />;
}
