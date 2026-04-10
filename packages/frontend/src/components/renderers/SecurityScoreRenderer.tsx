import type { RendererProps } from './index';
import { CircularGauge } from '@/components/ui/CircularGauge';
import { GradeBadge, MiniBar, SectionLabel } from './Shared';

export function SecurityScoreRenderer({ data }: RendererProps) {
  const score = data['overallScore'] as number ?? 0;
  const grade = data['grade'] as string ?? 'F';
  const breakdown = data['breakdown'] as Array<{ category: string; score: number; maxPoints: number }> ?? [];
  const recommendations = data['recommendations'] as string[] ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-6">
        <CircularGauge value={score} label="SCORE" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-bold text-argus-text-primary">Grade</span>
            <GradeBadge grade={grade} size="lg" />
          </div>
          <p className="text-xs text-argus-text-muted">Composite security assessment across 11 categories</p>
        </div>
      </div>

      <SectionLabel>Breakdown</SectionLabel>
      <div className="space-y-2">
        {breakdown.map((b) => {
          // Calculate the percentage relative to this category's max
          const pct = b.maxPoints > 0 ? Math.round((b.score / b.maxPoints) * 100) : 0;
          const color = pct >= 80 ? 'green' : pct >= 50 ? 'amber' : 'red';
          return (
            <div key={b.category}>
              <div className="flex justify-between text-[11px] mb-0.5">
                <span className="text-argus-text-secondary">{b.category}</span>
                <span className="text-argus-text-muted font-mono">{b.score}/{b.maxPoints} pts</span>
              </div>
              <MiniBar value={b.score} max={b.maxPoints} color={color} />
            </div>
          );
        })}
      </div>

      {/* Total score summary */}
      <div className="flex justify-between items-center pt-2 border-t border-white/5">
        <span className="text-xs text-argus-text-secondary font-semibold">Total Score</span>
        <span className="text-sm font-mono font-bold text-argus-accent-cyan">{score}/100</span>
      </div>

      {recommendations.length > 0 && (
        <>
          <SectionLabel>Recommendations</SectionLabel>
          <ul className="space-y-1">
            {recommendations.map((r, i) => (
              <li key={i} className="text-[11px] text-amber-400/80 flex items-start gap-1.5">
                <span className="text-amber-400 mt-0.5">⚠</span> {r}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
