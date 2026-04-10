interface CircularGaugeProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export function CircularGauge({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  label,
}: CircularGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percent = Math.min(value / max, 1);
  const offset = circumference * (1 - percent);

  const getColor = (pct: number): string => {
    if (pct >= 0.9) return '#10b981'; // success
    if (pct >= 0.7) return '#06b6d4'; // teal
    if (pct >= 0.5) return '#f59e0b'; // warning
    return '#f43f5e'; // danger
  };

  const color = getColor(percent);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1e293b"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
          style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold font-mono" style={{ color }}>
          {Math.round(value)}
        </span>
        {label && <span className="text-[10px] uppercase tracking-wider text-argus-text-muted">{label}</span>}
      </div>
    </div>
  );
}
