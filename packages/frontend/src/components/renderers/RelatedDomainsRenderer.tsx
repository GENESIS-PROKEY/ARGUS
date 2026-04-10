import type { RendererProps } from './index';
import { Tag, EmptyState } from './Shared';

export function RelatedDomainsRenderer({ data }: RendererProps) {
  const domains = data['relatedDomains'] as Array<{ domain: string; source: string }> ?? [];
  const total = data['totalFound'] as number ?? 0;

  if (domains.length === 0) return <EmptyState message="No related domains found" />;

  return (
    <div className="space-y-2">
      <Tag variant="cyan">{total} related domain{total !== 1 ? 's' : ''}</Tag>
      <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-0.5">
        {domains.map((d, i) => (
          <div key={i} className="flex items-center justify-between py-0.5 border-b border-argus-card-border/10 last:border-0">
            <span className="text-xs font-mono text-argus-text-primary truncate">{d.domain}</span>
            <Tag variant={d.source === 'shared-certificate' ? 'purple' : 'neutral'}>{d.source}</Tag>
          </div>
        ))}
      </div>
    </div>
  );
}
