import type { RendererProps } from './index';
import { GradeBadge, KV, Tag } from './Shared';

export function TlsCiphersRenderer({ data }: RendererProps) {
  const protocol = data['protocol'] as string ?? '';
  const cipher = data['cipher'] as Record<string, string> ?? {};
  const analysis = data['analysis'] as Record<string, unknown> ?? {};

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <GradeBadge grade={analysis['grade'] as string ?? 'F'} />
        <Tag variant="cyan">{protocol}</Tag>
      </div>
      <KV label="Cipher Name" value={cipher['name']} mono />
      <KV label="Standard Name" value={cipher['standardName']} mono />
      <div className="flex gap-2 flex-wrap mt-2">
        <Tag variant={analysis['supportsPFS'] ? 'green' : 'red'}>{analysis['supportsPFS'] ? '✓' : '✗'} PFS</Tag>
        <Tag variant={analysis['usesAEAD'] ? 'green' : 'red'}>{analysis['usesAEAD'] ? '✓' : '✗'} AEAD</Tag>
        <Tag variant={analysis['isWeak'] ? 'red' : 'green'}>{analysis['isWeak'] ? '⚠ Weak' : '✓ Strong'}</Tag>
      </div>
    </div>
  );
}
