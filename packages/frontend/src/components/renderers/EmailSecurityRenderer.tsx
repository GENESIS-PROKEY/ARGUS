import type { RendererProps } from './index';
import { GradeBadge, StatusPill, SectionLabel, Tag } from './Shared';

export function EmailSecurityRenderer({ data }: RendererProps) {
  const spf = data['spf'] as Record<string, unknown> ?? {};
  const dmarc = data['dmarc'] as Record<string, unknown> ?? {};
  const dkim = data['dkim'] as Record<string, unknown> ?? {};
  const grade = data['grade'] as string ?? 'F';
  const score = data['score'] as number ?? 0;
  const recommendations = data['recommendations'] as string[] ?? [];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <GradeBadge grade={grade} />
        <span className="text-xs text-argus-text-muted">{score}/100</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'SPF', found: spf['found'] as boolean },
          { label: 'DMARC', found: dmarc['found'] as boolean },
          { label: 'DKIM', found: dkim['found'] as boolean },
        ].map(({ label, found }) => (
          <div key={label} className={`text-center p-2 rounded-lg border ${
            found ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'
          }`}>
            <p className={`text-xs font-bold ${found ? 'text-emerald-400' : 'text-rose-400'}`}>{label}</p>
            <p className="text-[10px] mt-0.5">{found ? '✓ Found' : '✗ Missing'}</p>
          </div>
        ))}
      </div>

      {spf['found'] && spf['analysis'] && (
        <>
          <SectionLabel>SPF Policy</SectionLabel>
          <p className="text-[10px] text-argus-text-muted font-mono break-all">
            all: {(spf['analysis'] as Record<string, unknown>)?.['allPolicy'] as string}
          </p>
        </>
      )}

      {recommendations.length > 0 && (
        <>
          <SectionLabel>Recommendations</SectionLabel>
          <ul className="space-y-1">
            {recommendations.map((r, i) => (
              <li key={i} className="text-[10px] text-amber-400/80">⚠ {r}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
