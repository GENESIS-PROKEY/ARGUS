import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScanStore } from '@/stores/scanStore';
import { Eye, RefreshCw, ArrowLeft, Download, Share2, Check, FileJson, FileText, Table } from 'lucide-react';
import { exportAsJSON, exportAsMarkdown, exportAsCSV, copyShareUrl } from '@/utils/export';

interface TopBarProps {
  domain: string;
}

export function TopBar({ domain }: TopBarProps) {
  const navigate = useNavigate();
  const { status, completedChecks, totalChecks, totalDuration, checks } = useScanStore();
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [shareState, setShareState] = useState<'idle' | 'copied'>('idle');
  const exportRef = useRef<HTMLDivElement>(null);

  const progress = totalChecks > 0 ? (completedChecks / totalChecks) * 100 : 0;
  const isComplete = status === 'complete';
  const isScanning = status === 'scanning';

  // Close export dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleShare = async () => {
    const ok = await copyShareUrl(domain);
    if (ok) {
      setShareState('copied');
      setTimeout(() => setShareState('idle'), 2000);
    }
  };

  return (
    <header className="sticky top-0 z-50 glass border-b border-argus-card-border">
      <div className="flex items-center justify-between px-3 sm:px-6 py-3 gap-2 sm:gap-4 min-w-0">
        {/* Left: Back + Logo */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <button onClick={() => navigate('/')} className="btn-secondary p-2" title="Back to home">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <img
              src="/argus-logo.png"
              alt="ARGUS"
              className="w-8 h-8 object-contain"
              style={{ filter: 'drop-shadow(0 0 6px rgba(0, 212, 255, 0.6))' }}
              onError={(e) => {
                // Fallback: show eye icon
                (e.target as HTMLImageElement).style.display = 'none';
                const next = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                if (next) next.style.display = 'flex';
              }}
            />
            <div className="w-7 h-7 items-center justify-center hidden">
              <Eye className="w-6 h-6 text-argus-accent-cyan" />
            </div>
            <span className="text-lg font-display font-bold text-gradient hidden sm:inline">ARGUS</span>
          </div>
        </div>

        {/* Center: Domain + progress */}
        <div className="flex-1 mx-2 sm:mx-8 min-w-0">
          <div className="flex items-center justify-center gap-3">
            <img
              src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
              alt=""
              className="w-5 h-5 rounded-sm"
              loading="lazy"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <span className="font-mono text-argus-accent-cyan font-semibold text-lg hidden sm:inline">{domain}</span>
            <span className="font-mono text-argus-accent-cyan font-semibold text-sm sm:hidden">{domain}</span>
            {!isComplete && isScanning && (
              <span className="text-sm text-argus-text-muted">
                {completedChecks}/{totalChecks} checks
              </span>
            )}
            {isComplete && (
              <span className="text-sm text-argus-success">
                ✓ Complete in {(totalDuration / 1000).toFixed(1)}s
              </span>
            )}
          </div>
          {/* Progress bar */}
          {isScanning && (
            <div className="mt-1 h-0.5 bg-argus-card-border rounded-full overflow-hidden max-w-md mx-auto">
              <div
                className="h-full bg-gradient-to-r from-argus-accent-cyan to-argus-accent-purple rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
          {/* Tagline during scan */}
          {isScanning && (
            <p className="text-center text-[10px] text-argus-accent-cyan/50 mt-1 animate-pulse">
              Nothing escapes ARGUS.
            </p>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Share */}
          <button
            onClick={handleShare}
            className="btn-secondary flex items-center gap-2 text-sm"
            disabled={!isComplete}
            title="Copy share link"
          >
            {shareState === 'copied' ? (
              <Check className="w-3.5 h-3.5 text-argus-success" />
            ) : (
              <Share2 className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">{shareState === 'copied' ? 'Copied!' : 'Share'}</span>
          </button>

          {/* Export dropdown */}
          <div className="relative" ref={exportRef}>
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="btn-secondary flex items-center gap-2 text-sm"
              disabled={!isComplete}
              title="Export results"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 glass border border-argus-card-border rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in-0 slide-in-from-top-2">
                <button
                  onClick={() => { exportAsJSON(domain, checks); setShowExportMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-argus-text-secondary hover:bg-argus-accent-cyan/10 hover:text-argus-text-primary transition-colors"
                >
                  <FileJson className="w-4 h-4 text-argus-accent-cyan" />
                  Export JSON
                </button>
                <button
                  onClick={() => { exportAsMarkdown(domain, checks); setShowExportMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-argus-text-secondary hover:bg-argus-accent-cyan/10 hover:text-argus-text-primary transition-colors"
                >
                  <FileText className="w-4 h-4 text-argus-accent-cyan" />
                  Export Markdown
                </button>
                <button
                  onClick={() => { exportAsCSV(domain, checks); setShowExportMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-argus-text-secondary hover:bg-argus-accent-cyan/10 hover:text-argus-text-primary transition-colors"
                >
                  <Table className="w-4 h-4 text-argus-accent-cyan" />
                  Export CSV
                </button>
              </div>
            )}
          </div>

          {/* Rescan */}
          <button
            onClick={() => {
              const { reset, startScan } = useScanStore.getState();
              reset();
              startScan(domain);
            }}
            className="btn-secondary flex items-center gap-2 text-sm"
            disabled={isScanning}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Rescan</span>
          </button>
        </div>
      </div>
    </header>
  );
}
