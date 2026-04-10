import type { CheckStatusState } from '@argus/shared';

interface StatusDotProps {
  status: CheckStatusState;
  size?: 'sm' | 'md';
}

const statusConfig: Record<CheckStatusState, { color: string; pulse: boolean }> = {
  pending: { color: 'bg-argus-text-muted', pulse: false },
  running: { color: 'bg-argus-accent-cyan', pulse: true },
  success: { color: 'bg-argus-success', pulse: false },
  error: { color: 'bg-argus-danger', pulse: false },
  timeout: { color: 'bg-argus-warning', pulse: false },
};

export function StatusDot({ status, size = 'sm' }: StatusDotProps) {
  const config = statusConfig[status];
  const sizeClass = size === 'sm' ? 'w-2 h-2' : 'w-3 h-3';

  return (
    <span className="relative flex-shrink-0">
      {config.pulse && (
        <span
          className={`absolute inset-0 ${sizeClass} ${config.color} rounded-full animate-ping opacity-40`}
        />
      )}
      <span className={`relative block ${sizeClass} ${config.color} rounded-full`} />
    </span>
  );
}
