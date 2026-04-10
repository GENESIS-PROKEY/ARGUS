import type { RendererProps } from './index';
import { SectionLabel, Tag, GradeBadge, EmptyState } from './Shared';

export function HiddenPathsRenderer({ data }: RendererProps) {
  const results = data['results'] as Array<{ path: string; status: number | null; risk: string }> ?? [];
  const exposedCount = data['exposedCount'] as number ?? 0;
  const forbiddenCount = data['forbiddenCount'] as number ?? 0;
  const totalChecked = data['totalChecked'] as number ?? 0;
  const riskLevel = data['riskLevel'] as string ?? 'none';
  const grade = data['grade'] as string ?? 'N/A';
  const criticalExposures = data['criticalExposures'] as string[] ?? [];

  if (results.length === 0) return <EmptyState message="No path scanning data available" />;

  const riskBanner: Record<string, { bg: string; text: string; label: string }> = {
    none: { bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-400', label: '✓ No Exposed Paths' },
    low: { bg: 'bg-cyan-500/10 border-cyan-500/20', text: 'text-cyan-400', label: 'Low Risk — Forbidden Paths Detected' },
    medium: { bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-400', label: '⚠ Medium Risk — Exposed Paths Found' },
    high: { bg: 'bg-rose-500/10 border-rose-500/20', text: 'text-rose-400', label: '🚨 High Risk — Critical Exposure' },
  };

  const banner = riskBanner[riskLevel] ?? riskBanner['none'];
  const statusColor = (risk: string) => risk === 'critical' ? 'red' : risk === 'medium' ? 'amber' : risk === 'safe' ? 'green' : 'neutral';
  const statusIcon = (status: number | null) => {
    if (status === null) return '⏱';
    if (status === 200) return '🔓';
    if (status === 403) return '🔒';
    if (status === 404) return '✓';
    return `${status}`;
  };

  return (
    <div className="space-y-3">
      {/* Risk banner */}
      <div className={`flex items-center justify-between p-3 rounded-lg border ${banner.bg}`}>
        <span className={`text-sm font-semibold ${banner.text}`}>{banner.label}</span>
        <GradeBadge grade={grade} size="sm" />
      </div>

      <div className="flex gap-2 flex-wrap">
        <Tag variant="cyan">{totalChecked} paths checked</Tag>
        {exposedCount > 0 && <Tag variant="red">{exposedCount} exposed</Tag>}
        {forbiddenCount > 0 && <Tag variant="amber">{forbiddenCount} forbidden</Tag>}
      </div>

      {criticalExposures.length > 0 && (
        <>
          <SectionLabel>⚠ Critical Exposures</SectionLabel>
          <div className="space-y-1">
            {criticalExposures.map((p) => (
              <div key={p} className="flex items-center gap-2 p-2 rounded bg-rose-500/5 border border-rose-500/20">
                <span className="text-rose-400 text-sm">🔓</span>
                <span className="text-xs font-mono text-rose-400">{p}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <SectionLabel>All Paths</SectionLabel>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
        {results.map((r) => (
          <div key={r.path} className="flex items-center gap-2 py-1 px-1.5 rounded hover:bg-argus-card-border/10 transition-colors">
            <span className="text-xs w-5 text-center">{statusIcon(r.status)}</span>
            <span className="text-xs font-mono text-argus-text-secondary truncate flex-1">{r.path}</span>
            <Tag variant={statusColor(r.risk)}>{r.status ?? '—'}</Tag>
          </div>
        ))}
      </div>
    </div>
  );
}
