import type { RendererProps } from './index';
import { Tag, SectionLabel } from './Shared';

interface PortResult { port: number; service: string; isOpen?: boolean; }

export function OpenPortsRenderer({ data }: RendererProps) {
  const openPorts = data['openPorts'] as PortResult[] ?? [];
  const scannedCount = data['scannedCount'] as number ?? 0;
  const closedPorts = data['closedPorts'] as PortResult[] ?? [];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <Tag variant={openPorts.length > 0 ? 'cyan' : 'neutral'}>{openPorts.length} open</Tag>
        <Tag variant="neutral">{closedPorts.length} closed</Tag>
        <p className="text-[10px] text-argus-text-muted">of {scannedCount} scanned</p>
      </div>
      {openPorts.length > 0 && (
        <div className="grid grid-cols-2 gap-1.5">
          {openPorts.map((p) => (
            <div key={p.port} className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/15">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono text-emerald-400">{p.port}</span>
              <span className="text-[10px] text-argus-text-muted">{p.service}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
