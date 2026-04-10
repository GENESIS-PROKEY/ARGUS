import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Zap, Globe, Lock, Clock, History } from 'lucide-react';
import { useHistoryStore } from '@/stores/historyStore';

export function HomePage() {
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!url.trim() || isScanning) return;

    setIsScanning(true);
    let hostname = url.trim();
    try {
      hostname = hostname.includes('://')
        ? new URL(hostname).hostname
        : new URL(`https://${hostname}`).hostname;
    } catch {
      /* use raw input */
    }

    setTimeout(() => {
      navigate(`/results/${encodeURIComponent(hostname)}`);
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient glow orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-argus-accent-cyan/[0.04] rounded-full blur-3xl animate-pulse-slow" />
        <div
          className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-argus-accent-purple/[0.04] rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: '1.5s' }}
        />
      </div>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center mb-12 relative z-10"
      >
        <div className="flex flex-col items-center justify-center mb-4">
          <img
            src="/argus-logo.png"
            alt="ARGUS — All Seeing Web Intelligence Platform"
            className="w-[200px] h-[200px] object-contain"
            style={{ filter: 'drop-shadow(0 0 20px rgba(0, 212, 255, 0.4))' }}
          />
        </div>
        {/* Tagline */}
        <p className="text-lg font-display italic text-argus-accent-cyan/80 mb-4 tracking-wide">
          Nothing escapes ARGUS.
        </p>
        <p className="text-xl text-argus-text-secondary max-w-2xl mx-auto leading-relaxed">
          The all-seeing web intelligence platform. Enter any URL to run{' '}
          <span className="text-argus-accent-cyan font-semibold">42 parallel OSINT checks</span>{' '}
          and get a comprehensive security dashboard.
        </p>
      </motion.div>

      {/* Search bar */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        onSubmit={handleSubmit}
        className="w-full max-w-2xl relative z-10"
      >
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-argus-accent-cyan to-argus-accent-purple rounded-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 blur" />
          <div className="relative flex items-center bg-argus-card border border-argus-card-border rounded-2xl overflow-hidden">
            <Globe className="ml-5 w-5 h-5 text-argus-text-muted flex-shrink-0" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter any URL, domain, or IP address..."
              className="input-field flex-1 text-lg px-4 py-5"
              autoFocus
              spellCheck={false}
              disabled={isScanning}
            />
            <button type="submit" disabled={!url.trim() || isScanning} className="btn-primary mr-2 flex items-center gap-2">
              {isScanning ? (
                <div className="w-4 h-4 border-2 border-argus-bg-deep/30 border-t-argus-bg-deep rounded-full animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              {isScanning ? 'Scanning...' : 'Scan'}
            </button>
          </div>
        </div>
      </motion.form>

      {/* Feature pills */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="flex flex-wrap justify-center gap-3 mt-10 relative z-10"
      >
        {[
          { icon: Zap, label: '42 Parallel Checks' },
          { icon: Lock, label: 'Security Scoring' },
          { icon: Globe, label: 'Real-time Streaming' },
        ].map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-argus-text-secondary"
          >
            <Icon className="w-4 h-4 text-argus-accent-cyan" />
            {label}
          </div>
        ))}
      </motion.div>

      {/* Example domains */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        className="mt-8 text-sm text-argus-text-muted relative z-10"
      >
        Try:{' '}
        {['google.com', 'github.com', 'cloudflare.com'].map((domain, i) => (
          <span key={domain}>
            {i > 0 && ', '}
            <button
              onClick={() => setUrl(domain)}
              className="text-argus-accent-cyan/70 hover:text-argus-accent-cyan transition-colors underline underline-offset-2"
            >
              {domain}
            </button>
          </span>
        ))}
      </motion.div>

      {/* Recent scans + History link */}
      <RecentScans />
    </div>
  );
}

/* ─── Recent Scans sub-component ─── */
function RecentScans() {
  const navigate = useNavigate();
  const { entries } = useHistoryStore();

  if (entries.length === 0) return null;

  const recent = entries.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.9 }}
      className="mt-12 relative z-10 w-full max-w-2xl"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm text-argus-text-muted">
          <Clock className="w-3.5 h-3.5" />
          Recent Scans
        </div>
        <button
          onClick={() => navigate('/history')}
          className="flex items-center gap-1.5 text-xs text-argus-accent-cyan/70 hover:text-argus-accent-cyan transition-colors"
        >
          <History className="w-3 h-3" />
          View All ({entries.length})
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {recent.map((entry) => (
          <button
            key={entry.id}
            onClick={() => navigate(`/results/${encodeURIComponent(entry.domain)}`)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass text-sm text-argus-text-secondary hover:text-argus-accent-cyan hover:border-argus-accent-cyan/30 transition-colors"
          >
            <span className="font-mono text-xs">{entry.domain}</span>
            <span className="text-[10px] text-argus-text-muted">
              {entry.passedChecks}/{entry.totalChecks}✓
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
