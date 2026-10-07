'use client';

import { cn } from '@/lib/utils';
import type { ConnectionStatus } from './types/chat';

const STATUS_CONFIG: Record<ConnectionStatus, { label: string; className: string }> = {
  connecting: { label: 'Connecting...', className: 'bg-amber-100 text-amber-800' },
  connected: { label: 'Online', className: 'bg-emerald-100 text-emerald-800' },
  disconnected: { label: 'Disconnected', className: 'bg-gray-100 text-gray-600' },
  error: { label: 'Error', className: 'bg-red-100 text-red-800' },
  closed: { label: 'Closed', className: 'bg-gray-100 text-gray-500' },
};

type ConnectionStatusBadgeProps = {
  status: ConnectionStatus;
  className?: string;
};

function ConnectionStatusBadge({ status, className }: ConnectionStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.disconnected;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.className,
        className
      )}
    >
      <span
        className={cn(
          'mr-1.5 h-1.5 w-1.5 rounded-full',
          status === 'connected' && 'bg-emerald-500',
          status === 'connecting' && 'animate-pulse bg-amber-500',
          (status === 'disconnected' || status === 'error' || status === 'closed') && 'bg-gray-400'
        )}
      />
      {config.label}
    </span>
  );
}

export default ConnectionStatusBadge;
