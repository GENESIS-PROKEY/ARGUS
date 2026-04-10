import type { RendererProps } from './index';
import { KV, SectionLabel, Tag, EmptyState } from './Shared';

export function CdnDetectionRenderer({ data }: RendererProps) {
  const detected = data['detected'] as boolean ?? false;
  const provider = data['provider'] as string | null;
  const confidence = data['confidence'] as string ?? 'none';
  const evidence = data['evidence'] as string[] ?? [];

  if (!detected) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-3 p-3 rounded-lg border bg-argus-card-border/10 border-argus-card-border">
          <div className="w-12 h-12 rounded-xl bg-argus-card-border/20 flex items-center justify-center">
            <span className="text-2xl">🌐</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-argus-text-primary">No CDN Detected</p>
            <p className="text-xs text-argus-text-muted">Origin server appears to serve content directly</p>
          </div>
        </div>
      </div>
    );
  }

  const confColors: Record<string, string> = {
    high: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    low: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  };

  const cdnEmoji: Record<string, string> = {
    'Cloudflare': '☁️', 'AWS CloudFront': '☁️', 'Fastly': '⚡', 'Akamai': '🌊',
    'Vercel': '▲', 'Netlify': '◆', 'Azure CDN': '☁️', 'Google Cloud CDN': '🌐',
    'Bunny CDN': '🐰', 'Sucuri': '🛡️',
  };

  return (
    <div className="space-y-3">
      {/* Hero card */}
      <div className="flex items-center gap-4 p-4 rounded-xl border bg-argus-accent-cyan/5 border-argus-accent-cyan/20">
        <div className="w-14 h-14 rounded-xl bg-argus-accent-cyan/10 border border-argus-accent-cyan/20 flex items-center justify-center">
          <span className="text-3xl">{cdnEmoji[provider ?? ''] ?? '☁️'}</span>
        </div>
        <div>
          <p className="text-lg font-bold text-argus-text-primary">{provider}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${confColors[confidence] ?? confColors['low']}`}>
              {confidence.toUpperCase()} CONFIDENCE
            </span>
          </div>
        </div>
      </div>

      <KV label="Provider" value={provider ?? '—'} />
      <KV label="Confidence" value={confidence} />

      {evidence.length > 0 && (
        <>
          <SectionLabel>Evidence Headers</SectionLabel>
          <div className="space-y-1">
            {evidence.map((e, i) => (
              <div key={i} className="flex gap-2 py-1 border-b border-argus-card-border/20 last:border-0">
                <Tag variant="cyan">{e.split(':')[0]}</Tag>
                <span className="text-xs text-argus-text-secondary font-mono truncate">{e.split(':').slice(1).join(':').trim()}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
