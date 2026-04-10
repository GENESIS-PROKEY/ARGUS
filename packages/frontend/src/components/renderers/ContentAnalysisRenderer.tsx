import type { RendererProps } from './index';
import { GradeBadge, KV, Tag, SectionLabel } from './Shared';

export function ContentAnalysisRenderer({ data }: RendererProps) {
  const title = data['title'] as string | null;
  const description = data['description'] as string | null;
  const seoGrade = data['seoGrade'] as string ?? 'F';
  const seoScore = data['seoScore'] as number ?? 0;
  const headings = data['headings'] as Record<string, number> ?? {};
  const og = data['openGraph'] as Record<string, string> | null;
  const wordCount = data['wordCount'] as number ?? 0;
  const images = data['images'] as Record<string, number> ?? {};
  const lang = data['language'] as string | null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <GradeBadge grade={seoGrade} />
        <span className="text-xs text-argus-text-muted">SEO: {seoScore}/100</span>
      </div>

      {title && (
        <div>
          <p className="text-[10px] text-argus-text-muted">Title</p>
          <p className="text-xs text-argus-text-primary">{title}</p>
        </div>
      )}
      {description && (
        <div>
          <p className="text-[10px] text-argus-text-muted">Description</p>
          <p className="text-[11px] text-argus-text-secondary line-clamp-2">{description}</p>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        <Tag variant="neutral">{wordCount} words</Tag>
        <Tag variant="neutral">H1:{headings['h1']} H2:{headings['h2']} H3:{headings['h3']}</Tag>
        {lang && <Tag variant="neutral">{lang}</Tag>}
        <Tag variant={images['withoutAlt'] === 0 ? 'green' : 'amber'}>Images: {images['total']} ({images['withoutAlt']} missing alt)</Tag>
        {og && <Tag variant="green">OpenGraph ✓</Tag>}
      </div>
    </div>
  );
}
