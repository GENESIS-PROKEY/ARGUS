import { useState, useMemo } from 'react';
import type { CheckStatus } from '@argus/shared';
import { StatusDot } from './StatusDot';
import { CardErrorBoundary } from './ErrorBoundary';
import { ChevronDown, ChevronUp, Copy, Check, Code } from 'lucide-react';
import { getRenderer } from '../renderers';

interface CheckCardProps {
  check: CheckStatus;
}

export function CheckCard({ check }: CheckCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [copied, setCopied] = useState(false);

  const isLoading = check.status === 'running' || check.status === 'pending';
  const isError = check.status === 'error';
  const hasData = check.result?.success && check.result.data;

  const Renderer = useMemo(() => getRenderer(check.id), [check.id]);

  const handleCopy = async () => {
    if (check.result?.data) {
      await navigator.clipboard.writeText(JSON.stringify(check.result.data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="card-glow overflow-hidden">
      {/* Header */}
      <button
        onClick={() => !isLoading && setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <StatusDot status={check.status} />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-argus-text-primary truncate">{check.name}</h3>
          {check.result?.duration !== undefined && (
            <span className="text-xs text-argus-text-muted">{check.result.duration}ms</span>
          )}
        </div>
        {check.result?.cached && (
          <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-argus-accent-purple/10 text-argus-accent-violet border border-argus-accent-purple/20">
            cached
          </span>
        )}
        {!isLoading && (expanded ? <ChevronUp className="w-4 h-4 text-argus-text-muted" /> : <ChevronDown className="w-4 h-4 text-argus-text-muted" />)}
      </button>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="px-4 pb-4 space-y-2">
          <div className="h-3 bg-argus-card-border/50 rounded animate-pulse w-3/4" />
          <div className="h-3 bg-argus-card-border/50 rounded animate-pulse w-1/2" />
          <div className="h-3 bg-argus-card-border/50 rounded animate-pulse w-2/3" />
        </div>
      )}

      {/* Error state */}
      {isError && !expanded && (
        <div className="px-4 pb-4">
          <p className="text-sm text-argus-danger/80">{check.result?.error ?? 'Check failed'}</p>
        </div>
      )}

      {/* Expanded content */}
      {expanded && check.result && (
        <div className="border-t border-argus-card-border">
          {/* Action bar */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-argus-card-border/50">
            <button
              onClick={() => setShowRaw(!showRaw)}
              className={`flex items-center gap-1 text-xs transition-colors ${
                showRaw ? 'text-argus-accent-cyan' : 'text-argus-text-muted hover:text-argus-text-secondary'
              }`}
            >
              <Code className="w-3 h-3" />
              {showRaw ? 'Rich View' : '<> JSON'}
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-argus-text-muted hover:text-argus-text-secondary transition-colors ml-auto"
            >
              {copied ? <Check className="w-3 h-3 text-argus-success" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {/* Data display */}
          <div className="p-4 max-h-[28rem] overflow-y-auto custom-scrollbar">
            {isError && (
              <p className="text-sm text-argus-danger mb-3">{check.result.error}</p>
            )}
            {showRaw ? (
              <pre className="text-xs font-mono text-argus-text-secondary whitespace-pre-wrap break-all">
                {JSON.stringify(check.result.data ?? check.result.error, null, 2)}
              </pre>
            ) : hasData && Renderer ? (
              <CardErrorBoundary>
                <Renderer data={check.result.data as Record<string, unknown>} result={check.result} />
              </CardErrorBoundary>
            ) : (
              <pre className="text-xs font-mono text-argus-text-secondary whitespace-pre-wrap break-all">
                {JSON.stringify(check.result.data ?? check.result.error, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
