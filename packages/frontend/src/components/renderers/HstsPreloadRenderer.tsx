import type { RendererProps } from './index';
import { StatusPill, KV, Tag } from './Shared';

export function HstsPreloadRenderer({ data }: RendererProps) {
  const isPreloaded = data['isPreloaded'] as boolean;
  const isPending = data['isPending'] as boolean;
  const preloadStatus = data['preloadStatus'] as string ?? 'unknown';
  const hstsHeader = data['hstsHeader'] as string | null;
  const hstsAnalysis = data['hstsAnalysis'] as Record<string, unknown> ?? {};
  const eligible = data['eligibleForPreload'] as boolean;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <StatusPill ok={isPreloaded} label={isPreloaded ? 'Preloaded' : isPending ? 'Pending' : 'Not Preloaded'} />
        {eligible && <Tag variant="green">Eligible</Tag>}
      </div>
      {hstsHeader && (
        <>
          <KV label="HSTS Header" value={<span className="font-mono text-[10px]">{hstsHeader}</span>} />
          <div className="flex gap-2 flex-wrap">
            <Tag variant={hstsAnalysis['includeSubdomains'] ? 'green' : 'amber'}>
              {hstsAnalysis['includeSubdomains'] ? '✓' : '✗'} includeSubDomains
            </Tag>
            <Tag variant={hstsAnalysis['preloadDirective'] ? 'green' : 'amber'}>
              {hstsAnalysis['preloadDirective'] ? '✓' : '✗'} preload
            </Tag>
            <Tag variant="neutral">max-age: {String(hstsAnalysis['maxAgeYears'] ?? '?')}y</Tag>
          </div>
        </>
      )}
      {!hstsHeader && <p className="text-xs text-rose-400/80">No HSTS header found</p>}
    </div>
  );
}
