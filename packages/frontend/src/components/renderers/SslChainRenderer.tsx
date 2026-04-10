import type { RendererProps } from './index';
import { KV, GradeBadge, StatusPill, SectionLabel, Tag } from './Shared';

interface CertInfo {
  subject: Record<string, string>;
  issuer: Record<string, string>;
  validFrom: string;
  validTo: string;
  fingerprint256: string;
}

export function SslChainRenderer({ data }: RendererProps) {
  const authorized = data['authorized'] as boolean;
  const protocol = data['protocol'] as string ?? 'unknown';
  const expiryDays = data['expiryDays'] as number ?? 0;
  const chain = data['chain'] as CertInfo[] ?? [];

  const expiryColor = expiryDays > 30 ? 'green' : expiryDays > 7 ? 'amber' : 'red';

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <StatusPill ok={authorized} label={authorized ? 'Trusted' : 'Untrusted'} />
        <Tag variant="cyan">{protocol}</Tag>
        <Tag variant={expiryColor}>{expiryDays} days until expiry</Tag>
      </div>

      <SectionLabel>Certificate Chain ({chain.length} certs)</SectionLabel>
      <div className="space-y-2">
        {chain.map((cert, i) => (
          <div key={i} className="relative pl-4 border-l-2 border-argus-accent-cyan/20">
            {i === 0 && <span className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-argus-accent-cyan" />}
            {i > 0 && <span className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-argus-card-border" />}
            <p className="text-xs font-semibold text-argus-text-primary">{cert.subject?.['CN'] ?? 'Unknown'}</p>
            <p className="text-[10px] text-argus-text-muted">
              Issued by: {cert.issuer?.['CN'] ?? cert.issuer?.['O'] ?? 'Unknown'}
            </p>
            <p className="text-[10px] text-argus-text-muted font-mono">
              {cert.validFrom} → {cert.validTo}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
