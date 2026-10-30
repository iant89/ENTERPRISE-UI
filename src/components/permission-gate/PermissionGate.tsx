import type { ReactNode } from 'react';
export interface PermissionGateProps {
  /** Whether the user may see the content. */
  allowed: boolean;
  /** Content rendered when `allowed` is true. */
  children: ReactNode;
  /** Content rendered when `allowed` is false. @default null */
  fallback?: ReactNode;
}
/** Presentation-only conditional rendering. Always enforce permissions in the backend. */
export function PermissionGate({ allowed, children, fallback = null }: PermissionGateProps) { return <>{allowed ? children : fallback}</>; }
