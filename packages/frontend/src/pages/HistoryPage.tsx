import { useNavigate } from 'react-router-dom';
import { useHistoryStore } from '@/stores/historyStore';
import { exportHistoryEntry } from '@/utils/export';
import { motion } from 'framer-motion';
import { Shield, Eye, Clock, Trash2, ArrowLeft, FileJson, FileText, ExternalLink, CheckCircle, XCircle } from 'lucide-react';

export function HistoryPage() {
  const navigate = useNavigate();
  const { entries, removeEntry, clearHistory } = useHistoryStore();

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    const now = Date.now();
    const diffMs = now - ts;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-argus-card-border">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="btn-secondary p-2" title="Back to home">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Shield className="w-7 h-7 text-argus-accent-cyan" />
                <Eye className="w-3 h-3 text-argus-accent-cyan absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <span className="text-lg font-display font-bold text-gradient">ARGUS</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-argus-text-muted" />
            <span className="text-sm text-argus-text-secondary font-semibold">Scan History</span>
          </div>
          <div>
            {entries.length > 0 && (
              <button
                onClick={() => { if (confirm('Clear all scan history?')) clearHistory(); }}
                className="btn-secondary text-sm flex items-center gap-2 text-rose-400 border-rose-500/20 hover:border-rose-500/40"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full">
        {entries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <Clock className="w-16 h-16 text-argus-card-border mb-4" />
            <h2 className="text-xl font-semibold text-argus-text-primary mb-2">No Scan History</h2>
            <p className="text-sm text-argus-text-muted mb-6 max-w-md">
              Completed scans will appear here. Go scan a domain to get started!
            </p>
            <button onClick={() => navigate('/')} className="btn-primary">
              Start Scanning
            </button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="card-glow p-4"
              >
                <div className="flex items-center gap-4">
                  {/* Domain + time */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <button
                        onClick={() => navigate(`/results/${encodeURIComponent(entry.domain)}`)}
                        className="font-mono text-sm font-semibold text-argus-accent-cyan hover:underline underline-offset-2 truncate"
                      >
                        {entry.domain}
                      </button>
                      <ExternalLink className="w-3 h-3 text-argus-text-muted flex-shrink-0" />
                    </div>
                    <p className="text-xs text-argus-text-muted">{formatTime(entry.timestamp)}</p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle className="w-3.5 h-3.5" />
                      {entry.passedChecks}
                    </div>
                    {entry.failedChecks > 0 && (
                      <div className="flex items-center gap-1 text-rose-400">
                        <XCircle className="w-3.5 h-3.5" />
                        {entry.failedChecks}
                      </div>
                    )}
                    <span className="text-argus-text-muted font-mono">{(entry.duration / 1000).toFixed(1)}s</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => exportHistoryEntry(entry, 'json')}
                      className="p-1.5 rounded-lg text-argus-text-muted hover:text-argus-accent-cyan hover:bg-argus-accent-cyan/10 transition-colors"
                      title="Export JSON"
                    >
                      <FileJson className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => exportHistoryEntry(entry, 'md')}
                      className="p-1.5 rounded-lg text-argus-text-muted hover:text-argus-accent-cyan hover:bg-argus-accent-cyan/10 transition-colors"
                      title="Export Markdown"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeEntry(entry.id)}
                      className="p-1.5 rounded-lg text-argus-text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
