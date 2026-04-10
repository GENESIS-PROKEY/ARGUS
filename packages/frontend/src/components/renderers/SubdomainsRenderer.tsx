import type { RendererProps } from './index';
import { Tag, EmptyState } from './Shared';

interface SubInfo { subdomain: string; ips?: string[]; sources: string[]; }

export function SubdomainsRenderer({ data }: RendererProps) {
  const subdomains = data['subdomains'] as SubInfo[] ?? [];
  const methods = data['methods'] as Record<string, number> ?? {};
  const total = data['totalFound'] as number ?? 0;

  if (subdomains.length === 0) return <EmptyState message="No subdomains discovered" />;

  return (
    <div className="space-y-2">
      <div className="flex gap-2 flex-wrap">
        <Tag variant="cyan">{total} found</Tag>
        {methods['dns'] > 0 && <Tag variant="neutral">DNS: {methods['dns']}</Tag>}
        {methods['ct'] > 0 && <Tag variant="neutral">CT: {methods['ct']}</Tag>}
      </div>
      <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-0.5">
        {subdomains.map((s) => (
          <div key={s.subdomain} className="flex items-center justify-between py-0.5 border-b border-argus-card-border/10 last:border-0">
            <span className="text-xs font-mono text-argus-text-primary truncate">{s.subdomain}</span>
            <div className="flex gap-1 shrink-0 ml-2">
              {s.sources.map((src) => <Tag key={src} variant={src === 'dns' ? 'green' : 'purple'}>{src}</Tag>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
