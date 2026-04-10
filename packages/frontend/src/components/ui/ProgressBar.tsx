interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export function ProgressBar({ value, max = 100, showLabel = false, size = 'sm' }: ProgressBarProps) {
  const percent = Math.min((value / max) * 100, 100);
  const heightClass = size === 'sm' ? 'h-1' : 'h-2';

  return (
    <div className="flex items-center gap-3">
      <div className={`flex-1 ${heightClass} bg-argus-card-border rounded-full overflow-hidden`}>
        <div
          className="h-full bg-gradient-to-r from-argus-accent-cyan to-argus-accent-purple rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-mono text-argus-text-muted whitespace-nowrap">
          {Math.round(percent)}%
        </span>
      )}
    </div>
  );
}
