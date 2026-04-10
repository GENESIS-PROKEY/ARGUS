import { useState } from 'react';
import type { RendererProps } from './index';
import { Tag, EmptyState } from './Shared';

type RecordData = Record<string, unknown>;

const TABS = ['A', 'AAAA', 'MX', 'NS', 'TXT', 'CNAME', 'CAA', 'SOA'] as const;

export function DnsRecordsRenderer({ data }: RendererProps) {
  const [tab, setTab] = useState<string>('A');

  const renderValue = (records: unknown): JSX.Element => {
    if (!records || (Array.isArray(records) && records.length === 0)) return <EmptyState message="No records found" />;
    if (typeof records === 'string') return <p className="text-xs font-mono text-argus-text-primary">{records}</p>;
    if (Array.isArray(records)) {
      return (
        <div className="space-y-1">
          {records.map((r, i) => (
            <div key={i} className="text-xs font-mono text-argus-text-primary py-0.5 border-b border-argus-card-border/10 last:border-0">
              {typeof r === 'string' ? r : typeof r === 'object' ? JSON.stringify(r) : String(r)}
            </div>
          ))}
        </div>
      );
    }
    if (typeof records === 'object') {
      return (
        <div className="space-y-1">
          {Object.entries(records as Record<string, unknown>).map(([k, v]) => (
            <div key={k} className="flex justify-between text-xs py-0.5 border-b border-argus-card-border/10 last:border-0">
              <span className="text-argus-text-muted">{k}</span>
              <span className="text-argus-text-primary font-mono">{String(v)}</span>
            </div>
          ))}
        </div>
      );
    }
    return <p className="text-xs">{String(records)}</p>;
  };

  // Count non-empty records
  const counts: Record<string, number> = {};
  for (const t of TABS) {
    const val = data[t];
    if (Array.isArray(val)) counts[t] = val.length;
    else if (val && typeof val === 'object') counts[t] = 1;
    else counts[t] = 0;
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-1 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
              tab === t
                ? 'bg-argus-accent-cyan/15 text-argus-accent-cyan border-argus-accent-cyan/30'
                : 'bg-transparent text-argus-text-muted border-argus-card-border/30 hover:text-argus-text-secondary'
            }`}
          >
            {t}{counts[t]! > 0 && <span className="ml-1 opacity-60">{counts[t]}</span>}
          </button>
        ))}
      </div>
      <div className="max-h-40 overflow-y-auto custom-scrollbar">
        {renderValue(data[tab])}
      </div>
    </div>
  );
}
