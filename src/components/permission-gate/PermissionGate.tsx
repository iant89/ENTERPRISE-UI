import type { ReactNode } from 'react';
export interface PermissionGateProps { allowed: boolean; children: ReactNode; fallback?: ReactNode }
/** Presentation-only conditional rendering. Always enforce permissions in the backend. */
export function PermissionGate({ allowed, children, fallback = null }: PermissionGateProps) { return <>{allowed ? children : fallback}</>; }
