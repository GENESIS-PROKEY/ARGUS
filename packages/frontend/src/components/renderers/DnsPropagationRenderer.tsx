import type { RendererProps } from './index';
import { SectionLabel, Tag, GradeBadge, EmptyState } from './Shared';

export function DnsPropagationRenderer({ data }: RendererProps) {
  const results = data['results'] as Array<{ name: string; resolver: string; ip: string | null; latency: number; error?: string }> ?? [];
  const consistent = data['consistent'] as boolean ?? false;
  const uniqueIPs = data['uniqueIPs'] as string[] ?? [];
  const grade = data['grade'] as string ?? 'N/A';

  if (results.length === 0) return <EmptyState message="No DNS propagation data available" />;

  const maxLatency = Math.max(...results.map(r => r.latency), 1);
  const latencyColor = (l: number) => l < 50 ? 'bg-emerald-400' : l < 150 ? 'bg-cyan-400' : l < 300 ? 'bg-amber-400' : 'bg-rose-400';

  return (
    <div className="space-y-3">
      {/* Consistency banner */}
      <div className={`flex items-center justify-between p-3 rounded-lg border ${
        consistent
          ? 'bg-emerald-500/10 border-emerald-500/20'
          : 'bg-amber-500/10 border-amber-500/20'
      }`}>
        <span className={`text-sm font-semibold ${consistent ? 'text-emerald-400' : 'text-amber-400'}`}>
          {consistent ? '✓ DNS Fully Propagated' : `⚠ ${uniqueIPs.length} Unique IPs Found`}
        </span>
        <GradeBadge grade={grade} size="sm" />
      </div>

      {uniqueIPs.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {uniqueIPs.map((ip) => (
            <Tag key={ip} variant="cyan">{ip}</Tag>
          ))}
        </div>
      )}

      <SectionLabel>Resolver Results</SectionLabel>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {results.map((r) => (
          <div key={r.resolver} className="p-2.5 rounded-lg border border-argus-card-border/30 bg-argus-card-border/5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-argus-text-primary">{r.name}</span>
              <span className="text-[10px] text-argus-text-muted font-mono">{r.resolver}</span>
            </div>
            <div className="flex items-center gap-2">
              {r.ip ? (
                <span className="text-xs font-mono text-argus-accent-cyan">{r.ip}</span>
              ) : (
                <span className="text-xs text-rose-400">Failed</span>
              )}
              <span className="text-[10px] text-argus-text-muted ml-auto">{r.latency}ms</span>
            </div>
            {/* Latency bar */}
            <div className="mt-1.5 h-1 bg-argus-card-border/30 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${latencyColor(r.latency)} transition-all duration-500`}
                style={{ width: `${(r.latency / maxLatency) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
