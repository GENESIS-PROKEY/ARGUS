import type { RendererProps } from './index';
import { GradeBadge, KV, Tag } from './Shared';

export function PerformanceRenderer({ data }: RendererProps) {
  const ttfb = data['ttfb'] as number ?? 0;
  const ttfbGrade = data['ttfbGrade'] as string ?? 'F';
  const totalLoadTime = data['totalLoadTime'] as number ?? 0;
  const pageSize = data['pageSizeFormatted'] as string ?? '';
  const compression = data['compression'] as Record<string, unknown> ?? {};
  const speed = data['transferSpeedKBps'] as number ?? 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="text-center">
          <p className="text-2xl font-bold font-mono text-argus-accent-cyan">{ttfb}<span className="text-xs text-argus-text-muted">ms</span></p>
          <p className="text-[10px] text-argus-text-muted">TTFB</p>
        </div>
        <GradeBadge grade={ttfbGrade} />
      </div>
      <KV label="Total Load Time" value={`${totalLoadTime}ms`} mono />
      <KV label="Page Size" value={pageSize} mono />
      <KV label="Transfer Speed" value={`${speed} KB/s`} mono />
      <div className="flex gap-2 flex-wrap">
        <Tag variant={compression['isCompressed'] ? 'green' : 'amber'}>
          {compression['isCompressed'] ? `✓ ${compression['encoding']}` : 'No Compression'}
        </Tag>
      </div>
    </div>
  );
}

export function QualityScoreRenderer({ data }: RendererProps) {
  const checks = data['checks'] as Array<{ name: string; passed: boolean; impact: string; detail: string }> ?? [];
  const score = data['score'] as number ?? 0;
  const grade = data['grade'] as string ?? 'F';
  const passed = data['passed'] as number ?? 0;
  const total = data['total'] as number ?? 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <GradeBadge grade={grade} size="lg" />
        <div>
          <p className="text-sm font-bold text-argus-text-primary">{score}/100</p>
          <p className="text-xs text-argus-text-muted">{passed}/{total} checks passed</p>
        </div>
      </div>
      <div className="space-y-0.5">
        {checks.map((c, i) => (
          <div key={i} className="flex items-center gap-2 py-1 border-b border-argus-card-border/15 last:border-0">
            <span className={`text-xs ${c.passed ? 'text-emerald-400' : 'text-rose-400'}`}>{c.passed ? '✓' : '✗'}</span>
            <span className="text-xs text-argus-text-primary flex-1">{c.name}</span>
            <Tag variant={c.impact === 'high' ? 'red' : c.impact === 'medium' ? 'amber' : 'neutral'}>{c.impact}</Tag>
          </div>
        ))}
      </div>
    </div>
  );
}
