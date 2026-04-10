import type { RendererProps } from './index';
import { SectionLabel, Tag, GradeBadge, MiniBar, EmptyState } from './Shared';

export function AccessibilityRenderer({ data }: RendererProps) {
  const score = data['score'] as number ?? 0;
  const passed = data['passed'] as string[] ?? [];
  const failed = data['failed'] as string[] ?? [];
  const total = data['total'] as number ?? 0;
  const grade = data['grade'] as string ?? 'N/A';
  const wcagLevel = data['wcagLevel'] as string ?? 'None';

  if (total === 0) return <EmptyState message="No accessibility data available" />;

  const scoreColor = score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-amber-400' : 'text-rose-400';
  const ringColor = score >= 80 ? 'stroke-emerald-400' : score >= 60 ? 'stroke-amber-400' : 'stroke-rose-400';
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="space-y-3">
      {/* Score gauge */}
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor"
              className="text-argus-card-border/30" strokeWidth="5" />
            <circle cx="40" cy="40" r="36" fill="none" className={ringColor}
              strokeWidth="5" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-lg font-bold ${scoreColor}`}>{score}%</span>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GradeBadge grade={grade} />
            <Tag variant={wcagLevel === 'AA' ? 'green' : wcagLevel === 'A' ? 'cyan' : 'neutral'}>
              WCAG {wcagLevel}
            </Tag>
          </div>
          <p className="text-xs text-argus-text-muted">{passed.length}/{total} criteria passed</p>
        </div>
      </div>

      <MiniBar value={passed.length} max={total} color={score >= 80 ? 'green' : score >= 60 ? 'amber' : 'red'} />

      {/* Passed / Failed columns */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <SectionLabel>✓ Passed ({passed.length})</SectionLabel>
          <div className="space-y-1">
            {passed.map((p) => (
              <div key={p} className="flex items-center gap-1.5 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                <span className="text-[10px] text-argus-text-secondary leading-tight">{p}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <SectionLabel>✗ Failed ({failed.length})</SectionLabel>
          <div className="space-y-1">
            {failed.map((f) => (
              <div key={f} className="flex items-center gap-1.5 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0" />
                <span className="text-[10px] text-argus-text-secondary leading-tight">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
