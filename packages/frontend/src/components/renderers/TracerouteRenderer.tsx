import type { RendererProps } from './index';
import { Tag } from './Shared';

interface Hop { hop: number; ip: string | null; rtt: number | null; }

export function TracerouteRenderer({ data }: RendererProps) {
  const hops = data['hops'] as Hop[] ?? [];
  const directLatency = data['directLatency'] as number;
  const targetIp = data['targetIp'] as string;

  // Calculate max RTT for bar scaling
  const maxRtt = Math.max(...hops.filter(h => h.rtt !== null).map(h => h.rtt!), 1);

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap items-center">
        <Tag variant="cyan">Target: {targetIp}</Tag>
        <Tag variant="green">Direct: {directLatency}ms</Tag>
        <Tag variant="neutral">{hops.length} hops</Tag>
      </div>

      {/* Visual hop path */}
      <div className="relative">
        {/* Connection line */}
        <div className="absolute left-[9px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-argus-accent-cyan via-argus-accent-purple to-argus-success opacity-40" />
        
        <div className="space-y-0">
          {hops.map((h, i) => {
            const isTimeout = h.ip === null;
            const rttPercent = h.rtt !== null ? (h.rtt / maxRtt) * 100 : 0;
            const rttColor = h.rtt !== null
              ? h.rtt < 20 ? 'bg-emerald-400' : h.rtt < 80 ? 'bg-amber-400' : 'bg-rose-400'
              : 'bg-argus-card-border/40';

            return (
              <div key={i} className="flex items-center gap-2 py-1.5 relative group">
                {/* Hop dot */}
                <div className={`w-[18px] h-[18px] rounded-full z-10 border-2 flex items-center justify-center text-[8px] font-mono font-bold
                  ${isTimeout 
                    ? 'border-argus-card-border/40 bg-argus-bg-deep text-argus-text-muted' 
                    : i === hops.length - 1 
                      ? 'border-argus-success bg-argus-success/20 text-argus-success' 
                      : 'border-argus-accent-cyan bg-argus-accent-cyan/10 text-argus-accent-cyan'
                  }`}
                >
                  {h.hop}
                </div>

                {/* IP */}
                <span className={`text-xs font-mono flex-1 min-w-0 truncate ${isTimeout ? 'text-argus-text-muted italic' : 'text-argus-text-primary'}`}>
                  {h.ip ?? '* * * (timeout)'}
                </span>

                {/* RTT bar + value */}
                {h.rtt !== null && (
                  <div className="flex items-center gap-1.5 ml-auto">
                    <div className="w-16 h-1.5 rounded-full bg-argus-card-border/20 overflow-hidden">
                      <div className={`h-full rounded-full ${rttColor} transition-all`} style={{ width: `${Math.max(rttPercent, 5)}%` }} />
                    </div>
                    <span className="text-[10px] font-mono text-argus-text-muted w-10 text-right">{h.rtt}ms</span>
                  </div>
                )}
                {h.rtt === null && (
                  <span className="text-[10px] text-argus-text-muted ml-auto">—</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {data['note'] && (
        <p className="text-[10px] text-argus-text-muted italic">{data['note'] as string}</p>
      )}
    </div>
  );
}
