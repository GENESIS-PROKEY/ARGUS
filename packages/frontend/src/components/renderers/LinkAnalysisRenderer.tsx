import type { RendererProps } from './index';
import { Tag, MiniBar } from './Shared';

export function LinkAnalysisRenderer({ data }: RendererProps) {
  const total = data['totalLinks'] as number ?? 0;
  const internal = data['internalLinks'] as number ?? 0;
  const external = data['externalLinks'] as number ?? 0;
  const extDomains = data['uniqueExternalDomains'] as string[] ?? [];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2 rounded-lg bg-argus-card-border/10 border border-argus-card-border/20">
          <p className="text-lg font-bold font-mono text-argus-accent-cyan">{total}</p>
          <p className="text-[9px] text-argus-text-muted">Total</p>
        </div>
        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/15">
          <p className="text-lg font-bold font-mono text-emerald-400">{internal}</p>
          <p className="text-[9px] text-argus-text-muted">Internal</p>
        </div>
        <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/15">
          <p className="text-lg font-bold font-mono text-violet-400">{external}</p>
          <p className="text-[9px] text-argus-text-muted">External</p>
        </div>
      </div>
      {total > 0 && <MiniBar value={internal} max={total} color="green" />}
      {extDomains.length > 0 && (
        <div className="max-h-24 overflow-y-auto custom-scrollbar">
          <p className="text-[10px] text-argus-text-muted mb-1">External Domains ({extDomains.length})</p>
          <div className="flex gap-1 flex-wrap">
            {extDomains.slice(0, 15).map((d) => <Tag key={d} variant="neutral">{d}</Tag>)}
          </div>
        </div>
      )}
    </div>
  );
}
