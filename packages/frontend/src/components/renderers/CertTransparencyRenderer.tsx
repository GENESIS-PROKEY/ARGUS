import type { RendererProps } from './index';
import { KV, SectionLabel, GradeBadge, Tag, EmptyState } from './Shared';

export function CertTransparencyRenderer({ data }: RendererProps) {
  const total = data['total'] as number ?? 0;
  const certs = data['certs'] as Array<{ issuer: string; commonName: string; notBefore: string; notAfter: string; status: string }> ?? [];
  const subdomains = data['subdomainsFound'] as string[] ?? [];
  const grade = data['grade'] as string ?? 'N/A';
  const firstSeen = data['firstSeen'] as string | null;
  const lastSeen = data['lastSeen'] as string | null;
  const expiringSoon = data['expiringSoon'] as number ?? 0;

  if (total === 0) return <EmptyState message="No certificate transparency data found" />;

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const statusColor = (s: string) => s === 'valid' ? 'green' : s === 'expiring-soon' ? 'amber' : 'red';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GradeBadge grade={grade} />
          <span className="text-xs text-argus-text-muted">{total} certificate{total !== 1 ? 's' : ''} found</span>
        </div>
        {expiringSoon > 0 && <Tag variant="amber">⚠ {expiringSoon} expiring soon</Tag>}
      </div>

      {(firstSeen || lastSeen) && (
        <>
          <SectionLabel>Date Range</SectionLabel>
          <div className="flex gap-4">
            {firstSeen && <KV label="First Seen" value={formatDate(firstSeen)} />}
            {lastSeen && <KV label="Last Seen" value={formatDate(lastSeen)} />}
          </div>
        </>
      )}

      {subdomains.length > 0 && (
        <>
          <SectionLabel>Discovered Subdomains ({subdomains.length})</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {subdomains.slice(0, 20).map((s) => (
              <Tag key={s} variant="cyan">{s}</Tag>
            ))}
            {subdomains.length > 20 && <Tag variant="neutral">+{subdomains.length - 20} more</Tag>}
          </div>
        </>
      )}

      <SectionLabel>Recent Certificates</SectionLabel>
      <div className="space-y-1">
        {certs.slice(0, 10).map((cert, i) => (
          <div key={i} className="flex items-center justify-between py-1.5 border-b border-argus-card-border/30 last:border-0 gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-argus-text-primary font-mono truncate">{cert.commonName}</p>
              <p className="text-[10px] text-argus-text-muted">{cert.issuer}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[10px] text-argus-text-muted">{formatDate(cert.notAfter)}</span>
              <Tag variant={statusColor(cert.status)}>{cert.status}</Tag>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
