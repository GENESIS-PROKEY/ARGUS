import type { RendererProps } from './index';
import { Tag, EmptyState, KV } from './Shared';

export function GlobalRankingRenderer({ data }: RendererProps) {
  const trancoRank = data['trancoRank'] as number | null;
  const pageRank = data['pageRank'] as number | null;
  const tier = data['tier'] as string ?? '';

  return (
    <div className="space-y-3">
      <div className="text-center py-2">
        <span className="text-3xl">🏆</span>
        {trancoRank ? (
          <>
            <p className="text-2xl font-bold font-mono text-argus-accent-cyan mt-1">#{trancoRank.toLocaleString()}</p>
            <p className="text-xs text-argus-text-muted">Tranco Global Rank</p>
          </>
        ) : (
          <p className="text-sm text-argus-text-muted mt-1">Not ranked in Tranco Top 1M</p>
        )}
      </div>
      <Tag variant={trancoRank && trancoRank <= 10000 ? 'green' : trancoRank ? 'cyan' : 'neutral'}>{tier}</Tag>
      {pageRank !== null && <KV label="Open PageRank" value={pageRank} mono />}
    </div>
  );
}

export function ArchiveHistoryRenderer({ data }: RendererProps) {
  const firstSnapshot = data['firstSnapshot'] as string | null;
  const latestSnapshot = data['latestSnapshot'] as string | null;
  const estimatedSnapshots = data['estimatedSnapshots'] as number ?? 0;
  const hasHistory = data['hasHistory'] as boolean;
  const archiveUrl = data['archiveUrl'] as string ?? '';

  if (!hasHistory) return <EmptyState message="No archive history found on the Wayback Machine" />;

  return (
    <div className="space-y-2">
      <div className="text-center py-2">
        <span className="text-3xl">🕰️</span>
      </div>
      <KV label="First Snapshot" value={firstSnapshot} />
      <KV label="Latest Snapshot" value={latestSnapshot} />
      <KV label="Estimated Pages" value={estimatedSnapshots.toLocaleString()} />
      <a href={archiveUrl} target="_blank" rel="noopener" className="text-xs text-argus-accent-cyan hover:underline block mt-2">
        View on Wayback Machine →
      </a>
    </div>
  );
}
