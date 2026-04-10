import type { RendererProps } from './index';
import { GradeBadge, StatusPill, Tag } from './Shared';

export function DnssecRenderer({ data }: RendererProps) {
  const enabled = data['dnssecEnabled'] as boolean;
  const hasDnskey = data['hasDnskey'] as boolean;
  const hasTlsa = data['hasTlsa'] as boolean;
  const grade = data['grade'] as string ?? 'F';

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <GradeBadge grade={grade} />
        <StatusPill ok={enabled} label={enabled ? 'DNSSEC Validated' : 'DNSSEC Not Validated'} />
      </div>
      <div className="flex gap-2 flex-wrap">
        <Tag variant={hasDnskey ? 'green' : 'amber'}>{hasDnskey ? '✓' : '✗'} DNSKEY</Tag>
        <Tag variant={hasTlsa ? 'green' : 'neutral'}>{hasTlsa ? '✓' : '✗'} DANE/TLSA</Tag>
        <Tag variant={enabled ? 'green' : 'amber'}>{enabled ? '✓' : '✗'} AD Flag</Tag>
      </div>
    </div>
  );
}
