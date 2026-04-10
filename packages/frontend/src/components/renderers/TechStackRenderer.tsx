import type { RendererProps } from './index';
import { Tag, EmptyState, SectionLabel } from './Shared';

interface Tech { name: string; category: string; confidence: number; }

const categoryColors: Record<string, 'cyan' | 'green' | 'purple' | 'amber' | 'red' | 'neutral'> = {
  'JavaScript Framework': 'cyan', 'UI Framework': 'cyan', 'Web Framework': 'cyan',
  'CDN': 'green', 'Hosting': 'green', 'PaaS': 'green',
  'Analytics': 'purple', 'Advertising': 'purple',
  'Security': 'amber', 'Server': 'amber',
  'CMS': 'red', 'Ecommerce': 'red',
};

export function TechStackRenderer({ data }: RendererProps) {
  const technologies = data['technologies'] as Tech[] ?? [];
  const byCategory = data['byCategory'] as Record<string, Tech[]> ?? {};
  const count = data['count'] as number ?? 0;

  if (count === 0) return <EmptyState message="No technologies detected" />;

  return (
    <div className="space-y-3">
      <Tag variant="cyan">{count} technolog{count !== 1 ? 'ies' : 'y'} detected</Tag>
      {Object.entries(byCategory).map(([category, techs]) => (
        <div key={category}>
          <SectionLabel>{category}</SectionLabel>
          <div className="flex gap-1.5 flex-wrap">
            {(techs as Tech[]).map((t) => (
              <div key={t.name} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-argus-card-border/15 border border-argus-card-border/20">
                <span className="text-xs text-argus-text-primary">{t.name}</span>
                {t.confidence < 100 && <span className="text-[9px] text-argus-text-muted">{t.confidence}%</span>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
