import type { RendererProps } from './index';
import { KV, GradeBadge, StatusPill, EmptyState } from './Shared';

export function Ipv6SupportRenderer({ data }: RendererProps) {
  const hasAAAARecord = data['hasAAAARecord'] as boolean ?? false;
  const ipv6Address = data['ipv6Address'] as string | null;
  const ipv4Address = data['ipv4Address'] as string | null;
  const reachable = data['reachable'] as boolean ?? false;
  const httpsSupported = data['httpsSupported'] as boolean ?? false;
  const grade = data['grade'] as string ?? 'N/A';

  return (
    <div className="space-y-3">
      {/* Grade header */}
      <div className={`flex items-center justify-between p-3 rounded-lg border ${
        hasAAAARecord
          ? 'bg-emerald-500/10 border-emerald-500/20'
          : 'bg-amber-500/10 border-amber-500/20'
      }`}>
        <span className={`text-sm font-semibold ${hasAAAARecord ? 'text-emerald-400' : 'text-amber-400'}`}>
          {hasAAAARecord ? '✓ IPv6 Supported' : '⚠ No IPv6 Support'}
        </span>
        <GradeBadge grade={grade} size="sm" />
      </div>

      {/* Status indicators */}
      <div className="space-y-2">
        <div className="flex items-center justify-between py-2 border-b border-argus-card-border/30">
          <span className="text-xs text-argus-text-muted">AAAA Record</span>
          <StatusPill ok={hasAAAARecord} label={hasAAAARecord ? 'Found' : 'Missing'} />
        </div>
        <div className="flex items-center justify-between py-2 border-b border-argus-card-border/30">
          <span className="text-xs text-argus-text-muted">IPv6 Reachable</span>
          <StatusPill ok={reachable} label={reachable ? 'Yes' : 'No'} />
        </div>
        <div className="flex items-center justify-between py-2 border-b border-argus-card-border/30">
          <span className="text-xs text-argus-text-muted">HTTPS over IPv6</span>
          <StatusPill ok={httpsSupported} label={httpsSupported ? 'Yes' : 'No'} />
        </div>
      </div>

      {/* Address comparison */}
      <div className="grid grid-cols-2 gap-3 mt-2">
        <div className="p-3 rounded-lg border border-argus-card-border/30 bg-argus-card-border/5">
          <p className="text-[10px] uppercase tracking-wider text-argus-text-muted mb-1">IPv4</p>
          <p className="text-xs font-mono text-argus-text-primary">{ipv4Address ?? '—'}</p>
        </div>
        <div className={`p-3 rounded-lg border ${hasAAAARecord ? 'border-argus-accent-cyan/20 bg-argus-accent-cyan/5' : 'border-argus-card-border/30 bg-argus-card-border/5'}`}>
          <p className="text-[10px] uppercase tracking-wider text-argus-text-muted mb-1">IPv6</p>
          <p className="text-xs font-mono text-argus-text-primary break-all">{ipv6Address ?? '—'}</p>
        </div>
      </div>
    </div>
  );
}
