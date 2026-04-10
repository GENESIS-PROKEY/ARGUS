import { useState } from 'react';
import type { RendererProps } from './index';
import { KV, Tag } from './Shared';

export function HttpHeadersRenderer({ data }: RendererProps) {
  const headers = data['headers'] as Record<string, string> ?? {};
  const statusCode = data['statusCode'] as number;
  const headerCount = data['headerCount'] as number ?? Object.keys(headers).length;
  const server = data['server'] as string | null;
  const [expanded, setExpanded] = useState(false);

  const entries = Object.entries(headers);
  const shown = expanded ? entries : entries.slice(0, 6);

  return (
    <div className="space-y-2">
      <div className="flex gap-2 flex-wrap items-center">
        <Tag variant={statusCode === 200 ? 'green' : statusCode >= 300 && statusCode < 400 ? 'amber' : 'red'}>{statusCode}</Tag>
        <Tag variant="neutral">{headerCount} headers</Tag>
        {server && <Tag variant="cyan">{server}</Tag>}
      </div>
      <div className="max-h-48 overflow-y-auto custom-scrollbar">
        {shown.map(([k, v]) => (
          <div key={k} className="flex items-start gap-2 py-1 border-b border-argus-card-border/15 last:border-0">
            <span className="text-[10px] font-mono text-argus-accent-cyan whitespace-nowrap">{k}</span>
            <span className="text-[10px] font-mono text-argus-text-muted break-all">{v}</span>
          </div>
        ))}
      </div>
      {entries.length > 6 && (
        <button onClick={() => setExpanded(!expanded)} className="text-[10px] text-argus-accent-cyan hover:underline">
          {expanded ? 'Show less' : `Show all ${entries.length} headers`}
        </button>
      )}
    </div>
  );
}
