import type { RendererProps } from './index';
import { Tag } from './Shared';

export function HttpVersionRenderer({ data }: RendererProps) {
  const bestProtocol = data['bestProtocol'] as string ?? '';
  const http11 = data['http11'] as boolean;
  const http2 = data['http2'] as boolean;
  const http3 = data['http3'] as boolean;
  const alpn = data['alpnProtocol'] as string | null;
  const altSvc = data['altSvc'] as string | null;

  return (
    <div className="space-y-3">
      <div className="text-center py-3">
        <p className="text-2xl font-bold text-argus-accent-cyan">{bestProtocol}</p>
        <p className="text-[10px] text-argus-text-muted mt-1">Best supported protocol</p>
      </div>
      <div className="flex justify-center gap-3">
        {[
          { label: 'HTTP/1.1', supported: http11 },
          { label: 'HTTP/2', supported: http2 },
          { label: 'HTTP/3', supported: http3 },
        ].map(({ label, supported }) => (
          <div key={label} className={`flex flex-col items-center px-3 py-2 rounded-lg border ${
            supported ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-argus-card-border/10 border-argus-card-border/20'
          }`}>
            <span className={`text-xs font-bold ${supported ? 'text-emerald-400' : 'text-argus-text-muted'}`}>{label}</span>
            <span className="text-[10px] mt-0.5">{supported ? '✓' : '—'}</span>
          </div>
        ))}
      </div>
      {alpn && <p className="text-[10px] text-argus-text-muted text-center">ALPN: <span className="font-mono">{alpn}</span></p>}
    </div>
  );
}
