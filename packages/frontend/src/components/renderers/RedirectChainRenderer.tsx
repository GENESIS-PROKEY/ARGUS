import type { RendererProps } from './index';
import { Tag, StatusPill } from './Shared';

interface Hop { url: string; statusCode: number; statusText: string; }

export function RedirectChainRenderer({ data }: RendererProps) {
  const chain = data['chain'] as Hop[] ?? [];
  const hasRedirects = data['hasRedirects'] as boolean;
  const hasUpgrade = data['hasHttpToHttpsUpgrade'] as boolean;
  const finalUrl = data['finalUrl'] as string;

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        <Tag variant="neutral">{chain.length} hop{chain.length !== 1 ? 's' : ''}</Tag>
        {hasUpgrade && <Tag variant="green">HTTP→HTTPS ✓</Tag>}
        {!hasRedirects && <Tag variant="green">No redirects</Tag>}
      </div>
      <div className="space-y-0">
        {chain.map((hop, i) => (
          <div key={i} className="flex items-start gap-2 relative">
            <div className="flex flex-col items-center">
              <span className={`w-2.5 h-2.5 rounded-full ${i === chain.length - 1 ? 'bg-emerald-400' : 'bg-argus-accent-cyan'}`} />
              {i < chain.length - 1 && <div className="w-px h-6 bg-argus-card-border/40" />}
            </div>
            <div className="pb-2 min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <Tag variant={hop.statusCode >= 300 && hop.statusCode < 400 ? 'amber' : hop.statusCode === 200 ? 'green' : 'red'}>
                  {hop.statusCode}
                </Tag>
                <span className="text-[10px] text-argus-text-muted">{hop.statusText}</span>
              </div>
              <p className="text-xs font-mono text-argus-text-primary truncate mt-0.5">{hop.url}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
