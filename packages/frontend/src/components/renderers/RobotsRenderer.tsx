import type { RendererProps } from './index';
import { Tag, EmptyState, KV } from './Shared';

export function RobotsRenderer({ data }: RendererProps) {
  const exists = data['exists'] as boolean;
  const totalRules = data['totalRules'] as number ?? 0;
  const totalDisallowed = data['totalDisallowed'] as number ?? 0;
  const sitemaps = data['sitemaps'] as string[] ?? [];

  if (!exists) return <EmptyState message="No robots.txt found" />;

  return (
    <div className="space-y-2">
      <div className="flex gap-2 flex-wrap">
        <Tag variant="green">robots.txt found</Tag>
        <Tag variant="neutral">{totalRules} user-agent rules</Tag>
        <Tag variant="neutral">{totalDisallowed} disallowed paths</Tag>
      </div>
      {sitemaps.length > 0 && (
        <div>
          <p className="text-[10px] text-argus-text-muted mb-1">Sitemaps Referenced</p>
          {sitemaps.map((s) => (
            <a key={s} href={s} target="_blank" rel="noopener" className="text-xs text-argus-accent-cyan hover:underline block truncate">{s}</a>
          ))}
        </div>
      )}
    </div>
  );
}

export function SitemapRenderer({ data }: RendererProps) {
  const exists = data['exists'] as boolean;
  const pageCount = data['pageCount'] as number ?? 0;
  const pages = data['pages'] as Array<{ url: string }> ?? [];

  if (!exists) return <EmptyState message="No sitemap found" />;

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Tag variant="green">Sitemap found</Tag>
        <Tag variant="neutral">{pageCount} page{pageCount !== 1 ? 's' : ''} indexed</Tag>
      </div>
      {pages.length > 0 && (
        <div className="max-h-32 overflow-y-auto custom-scrollbar space-y-0.5">
          {pages.slice(0, 20).map((p, i) => (
            <p key={i} className="text-[10px] font-mono text-argus-text-muted truncate">{typeof p === 'string' ? p : p.url}</p>
          ))}
          {pages.length > 20 && <p className="text-[10px] text-argus-text-muted">… and {pages.length - 20} more</p>}
        </div>
      )}
    </div>
  );
}
