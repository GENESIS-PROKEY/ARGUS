import type { RendererProps } from './index';
import { StatusPill, Tag, EmptyState } from './Shared';

export function WafRenderer({ data }: RendererProps) {
  const detected = data['detected'] as Array<{ name: string; evidence: string[] }> ?? [];
  const hasWaf = data['hasWaf'] as boolean;

  return (
    <div className="space-y-3">
      <StatusPill ok={hasWaf} label={hasWaf ? `${detected.length} WAF/CDN Detected` : 'No WAF Detected'} />
      {detected.length === 0 && <EmptyState message="No firewall or CDN protection detected from response headers" />}
      {detected.map((d, i) => (
        <div key={i} className="py-1.5 border-b border-argus-card-border/20 last:border-0">
          <p className="text-xs font-semibold text-argus-accent-cyan">{d.name}</p>
          {d.evidence.map((e, j) => <p key={j} className="text-[10px] text-argus-text-muted font-mono truncate">{e}</p>)}
        </div>
      ))}
    </div>
  );
}

export function SafeBrowsingRenderer({ data }: RendererProps) {
  // Handle unavailable state
  if (data['available'] === false) {
    const reason = data['reason'] as string ?? 'API key not configured';
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 p-3 rounded-lg bg-argus-card-border/10 border border-argus-card-border/20">
          <span className="text-2xl">🔑</span>
          <div>
            <p className="text-sm font-semibold text-argus-text-secondary">Not Available</p>
            <p className="text-[10px] text-argus-text-muted">{reason}</p>
          </div>
        </div>
        <p className="text-[10px] text-argus-text-muted italic">
          Add GOOGLE_SAFE_BROWSING_KEY to your .env file and restart the backend to enable this check.
        </p>
      </div>
    );
  }

  const isSafe = data['isSafe'] as boolean;
  const threats = data['threats'] as Array<{ type: string; platform?: string; url?: string }> ?? [];
  const checkedUrls = data['checkedUrls'] as string[] ?? [];

  return (
    <div className="space-y-3">
      <div className={`flex items-center gap-3 p-3 rounded-lg ${isSafe ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-rose-500/10 border border-rose-500/20'}`}>
        <span className="text-3xl">{isSafe ? '🛡️' : '⚠️'}</span>
        <div>
          <p className={`text-sm font-bold ${isSafe ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isSafe ? 'No Threats Detected' : `${threats.length} Threats Found!`}
          </p>
          <p className="text-[10px] text-argus-text-muted">Google Safe Browsing API</p>
        </div>
      </div>
      {threats.length > 0 && (
        <div className="space-y-1">
          {threats.map((t, i) => (
            <div key={i} className="flex items-center gap-2">
              <Tag variant="red">{(t.type ?? '').replace(/_/g, ' ')}</Tag>
              {t.platform && <span className="text-[10px] text-argus-text-muted">{t.platform}</span>}
            </div>
          ))}
        </div>
      )}
      {checkedUrls.length > 0 && (
        <div>
          <p className="text-[10px] text-argus-text-muted mb-1">Checked URLs:</p>
          {checkedUrls.map((url, i) => (
            <p key={i} className="text-[10px] font-mono text-argus-text-muted truncate">{url}</p>
          ))}
        </div>
      )}
    </div>
  );
}

export function VirusTotalRenderer({ data }: RendererProps) {
  // Handle unavailable state
  if (data['available'] === false) {
    const reason = data['reason'] as string ?? 'API key not configured';
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 p-3 rounded-lg bg-argus-card-border/10 border border-argus-card-border/20">
          <span className="text-2xl">🔑</span>
          <div>
            <p className="text-sm font-semibold text-argus-text-secondary">Not Available</p>
            <p className="text-[10px] text-argus-text-muted">{reason}</p>
          </div>
        </div>
        <p className="text-[10px] text-argus-text-muted italic">
          Add VIRUSTOTAL_API_KEY to your .env file and restart the backend to enable this check.
        </p>
      </div>
    );
  }

  const malicious = data['malicious'] as number ?? 0;
  const suspicious = data['suspicious'] as number ?? 0;
  const harmless = data['harmless'] as number ?? 0;
  const undetected = data['undetected'] as number ?? 0;
  const total = data['totalEngines'] as number ?? 0;
  const isSafe = data['isSafe'] as boolean;
  const reputation = data['reputation'] as number | null;
  const vtUrl = data['vtUrl'] as string | null;
  const categories = data['categories'] as Record<string, string> | null;

  return (
    <div className="space-y-3">
      {/* Status banner */}
      <div className={`flex items-center gap-3 p-3 rounded-lg ${isSafe ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-rose-500/10 border border-rose-500/20'}`}>
        <span className="text-3xl">{isSafe ? '✅' : '🔴'}</span>
        <div>
          <p className={`text-sm font-bold ${isSafe ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isSafe ? 'Clean — No Detections' : `${malicious + suspicious} Detections`}
          </p>
          <p className="text-[10px] text-argus-text-muted">{total} engines scanned</p>
        </div>
      </div>

      {/* Engine breakdown */}
      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          { label: 'Malicious', val: malicious, color: 'text-rose-400' },
          { label: 'Suspicious', val: suspicious, color: 'text-amber-400' },
          { label: 'Harmless', val: harmless, color: 'text-emerald-400' },
          { label: 'Undetected', val: undetected, color: 'text-argus-text-muted' },
        ].map(({ label, val, color }) => (
          <div key={label}>
            <p className={`text-lg font-bold font-mono ${color}`}>{val}</p>
            <p className="text-[9px] text-argus-text-muted">{label}</p>
          </div>
        ))}
      </div>

      {/* Detection bar */}
      {total > 0 && (
        <div className="h-2 rounded-full overflow-hidden flex bg-argus-card-border/20">
          {malicious > 0 && <div className="bg-rose-500" style={{ width: `${(malicious / total) * 100}%` }} />}
          {suspicious > 0 && <div className="bg-amber-500" style={{ width: `${(suspicious / total) * 100}%` }} />}
          {harmless > 0 && <div className="bg-emerald-500" style={{ width: `${(harmless / total) * 100}%` }} />}
          {undetected > 0 && <div className="bg-argus-card-border/40" style={{ width: `${(undetected / total) * 100}%` }} />}
        </div>
      )}

      {/* Reputation */}
      {reputation !== null && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-argus-text-muted">Reputation:</span>
          <span className={`text-xs font-mono font-bold ${reputation >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {reputation >= 0 ? '+' : ''}{reputation}
          </span>
        </div>
      )}

      {/* Categories */}
      {categories && Object.keys(categories).length > 0 && (
        <div className="flex flex-wrap gap-1">
          {Object.entries(categories).slice(0, 6).map(([vendor, cat]) => (
            <Tag key={vendor} variant="neutral">{cat}</Tag>
          ))}
        </div>
      )}

      {/* VT link */}
      {vtUrl && (
        <a href={vtUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-argus-accent-cyan hover:underline">
          View full report on VirusTotal →
        </a>
      )}
    </div>
  );
}
