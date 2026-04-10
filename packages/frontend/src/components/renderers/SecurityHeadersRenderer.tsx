import type { RendererProps } from './index';
import { GradeBadge, MiniBar, SectionLabel } from './Shared';

interface Audit {
  header: string;
  present: boolean;
  value: string | null;
  recommendation: string;
  severity: 'good' | 'warning' | 'critical';
  mdnLink: string;
}

export function SecurityHeadersRenderer({ data }: RendererProps) {
  const audits = data['audits'] as Audit[] ?? [];
  const score = data['score'] as number ?? 0;
  const grade = data['grade'] as string ?? 'F';

  const severityIcon = { good: '✓', warning: '⚠', critical: '✗' };
  const severityColor = { good: 'text-emerald-400', warning: 'text-amber-400', critical: 'text-rose-400' };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <GradeBadge grade={grade} />
        <div className="flex-1">
          <MiniBar value={score} max={100} color={score >= 70 ? 'green' : score >= 40 ? 'amber' : 'red'} />
          <p className="text-[10px] text-argus-text-muted mt-0.5">{score}/100 — {audits.filter(a => a.present).length}/{audits.length} headers present</p>
        </div>
      </div>

      <div className="space-y-0.5">
        {audits.map((audit) => (
          <div key={audit.header} className="flex items-start gap-2 py-1.5 border-b border-argus-card-border/20 last:border-0">
            <span className={`text-xs mt-0.5 ${severityColor[audit.severity]}`}>{severityIcon[audit.severity]}</span>
            <div className="flex-1 min-w-0">
              <a href={audit.mdnLink} target="_blank" rel="noopener" className="text-xs font-mono text-argus-text-primary hover:text-argus-accent-cyan transition-colors">
                {audit.header}
              </a>
              {audit.value && <p className="text-[10px] text-argus-text-muted truncate">{audit.value}</p>}
              {!audit.present && <p className="text-[10px] text-argus-text-muted italic">{audit.recommendation}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
