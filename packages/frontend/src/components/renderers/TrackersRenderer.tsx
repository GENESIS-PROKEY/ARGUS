import type { RendererProps } from './index';
import { SectionLabel, Tag, GradeBadge, EmptyState } from './Shared';

const categoryColors: Record<string, 'cyan' | 'red' | 'amber' | 'purple' | 'green'> = {
  analytics: 'cyan',
  advertising: 'red',
  social: 'purple',
  support: 'green',
  other: 'amber',
};

export function TrackersRenderer({ data }: RendererProps) {
  const trackers = data['trackers'] as Array<{ name: string; category: string; matchedPattern: string }> ?? [];
  const totalCount = data['totalCount'] as number ?? 0;
  const categories = data['categories'] as string[] ?? [];
  const grade = data['grade'] as string ?? 'N/A';

  if (totalCount === 0) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between p-3 rounded-lg border bg-emerald-500/10 border-emerald-500/20">
          <span className="text-sm font-semibold text-emerald-400">✓ No Third-Party Trackers Detected</span>
          <GradeBadge grade={grade} size="sm" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GradeBadge grade={grade} />
          <span className="text-xs text-argus-text-muted">{totalCount} tracker{totalCount !== 1 ? 's' : ''} found</span>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="flex flex-wrap gap-1.5">
        {categories.map((cat) => {
          const count = trackers.filter(t => t.category === cat).length;
          return <Tag key={cat} variant={categoryColors[cat] ?? 'neutral'}>{cat} ({count})</Tag>;
        })}
      </div>

      {/* Category bar */}
      <div className="h-3 bg-argus-card-border/20 rounded-full overflow-hidden flex">
        {categories.map((cat) => {
          const count = trackers.filter(t => t.category === cat).length;
          const pct = (count / totalCount) * 100;
          const colors: Record<string, string> = {
            analytics: 'bg-cyan-500',
            advertising: 'bg-rose-500',
            social: 'bg-violet-500',
            support: 'bg-emerald-500',
            other: 'bg-amber-500',
          };
          return (
            <div key={cat} className={`h-full ${colors[cat] ?? 'bg-gray-500'} transition-all`}
              style={{ width: `${pct}%` }} title={`${cat}: ${count}`} />
          );
        })}
      </div>

      <SectionLabel>Detected Trackers</SectionLabel>
      <div className="space-y-1">
        {trackers.map((t, i) => (
          <div key={i} className="flex items-center justify-between py-1.5 border-b border-argus-card-border/30 last:border-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className={`w-2 h-2 rounded-full ${
                t.category === 'analytics' ? 'bg-cyan-400' :
                t.category === 'advertising' ? 'bg-rose-400' :
                t.category === 'social' ? 'bg-violet-400' :
                t.category === 'support' ? 'bg-emerald-400' : 'bg-amber-400'
              }`} />
              <span className="text-xs text-argus-text-primary truncate">{t.name}</span>
            </div>
            <Tag variant={categoryColors[t.category] ?? 'neutral'}>{t.category}</Tag>
          </div>
        ))}
      </div>
    </div>
  );
}
