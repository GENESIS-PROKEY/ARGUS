import type { RendererProps } from './index';
import { Tag, EmptyState } from './Shared';

export function BreachCheckRenderer({ data }: RendererProps) {
  const available = data['available'] as boolean ?? false;
  const requiresApiKey = data['requiresApiKey'] as boolean ?? false;
  const note = data['note'] as string ?? '';

  if (!available && requiresApiKey) {
    return (
      <div className="space-y-3">
        <div className="flex flex-col items-center py-6 px-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-argus-accent-purple/10 border border-argus-accent-purple/20 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-argus-accent-violet" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h4 className="text-sm font-semibold text-argus-text-primary mb-1">Premium Feature</h4>
          <p className="text-xs text-argus-text-muted max-w-xs leading-relaxed">
            Domain breach checking requires a HaveIBeenPwned API subscription.
          </p>
          <a
            href="https://haveibeenpwned.com/API/Key"
            target="_blank"
            rel="noopener"
            className="mt-3 text-xs text-argus-accent-cyan hover:text-argus-accent-cyan/80 underline underline-offset-2 transition-colors"
          >
            Get API Key →
          </a>
          <Tag variant="purple">HIBP API Required</Tag>
        </div>
      </div>
    );
  }

  if (!available) {
    return <EmptyState message={note || 'Breach data unavailable'} />;
  }

  // When API is configured (future state)
  const breachCount = data['breachCount'] as number ?? 0;
  const breaches = data['breaches'] as Array<{ name: string; date: string; dataTypes: string[] }> ?? [];

  if (breachCount === 0) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg border bg-emerald-500/10 border-emerald-500/20">
        <span className="text-2xl">🛡️</span>
        <div>
          <p className="text-sm font-semibold text-emerald-400">No Known Breaches</p>
          <p className="text-xs text-argus-text-muted">This domain has not appeared in known data breaches</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Tag variant="red">{breachCount} breach{breachCount !== 1 ? 'es' : ''}</Tag>
      {breaches.map((b, i) => (
        <div key={i} className="p-2 rounded border border-argus-card-border/30">
          <p className="text-xs font-semibold text-argus-text-primary">{b.name}</p>
          <p className="text-[10px] text-argus-text-muted">{b.date}</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {b.dataTypes.map((dt) => <Tag key={dt} variant="red">{dt}</Tag>)}
          </div>
        </div>
      ))}
    </div>
  );
}
