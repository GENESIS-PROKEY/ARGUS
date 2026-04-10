import type { RendererProps } from './index';
import { StatusPill, Tag, EmptyState } from './Shared';

interface CookieInfo { name: string; value: string; httpOnly: boolean; secure: boolean; sameSite?: string; domain?: string; }

export function CookiesRenderer({ data }: RendererProps) {
  const cookies = data['cookies'] as CookieInfo[] ?? [];
  const issues = data['securityIssues'] as string[] ?? [];

  if (cookies.length === 0) return <EmptyState message="No cookies set on initial response" />;

  return (
    <div className="space-y-2">
      <div className="flex gap-2 flex-wrap">
        <Tag variant="neutral">{cookies.length} cookie{cookies.length > 1 ? 's' : ''}</Tag>
        {issues.length > 0 && <Tag variant="red">{issues.length} issue{issues.length > 1 ? 's' : ''}</Tag>}
        {issues.length === 0 && <Tag variant="green">All secure</Tag>}
      </div>
      {cookies.map((c, i) => (
        <div key={i} className="py-1.5 border-b border-argus-card-border/20 last:border-0">
          <p className="text-xs font-mono text-argus-text-primary truncate">{c.name}</p>
          <div className="flex gap-1.5 mt-1 flex-wrap">
            <StatusPill ok={c.secure} label="Secure" />
            <StatusPill ok={c.httpOnly} label="HttpOnly" />
            {c.sameSite && <Tag variant="neutral">SameSite={c.sameSite}</Tag>}
          </div>
        </div>
      ))}
    </div>
  );
}
