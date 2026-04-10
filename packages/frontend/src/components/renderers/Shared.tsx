import type { ReactNode } from 'react';

/* ─── Key-Value Row ─── */
export function KV({ label, value, mono }: { label: string; value: ReactNode; mono?: boolean }) {
  return (
    <div className="flex justify-between items-start gap-3 py-1.5 border-b border-argus-card-border/30 last:border-0">
      <span className="text-xs text-argus-text-muted whitespace-nowrap">{label}</span>
      <span className={`text-xs text-argus-text-primary text-right ${mono ? 'font-mono' : ''} break-all max-w-[65%]`}>{value ?? '—'}</span>
    </div>
  );
}

/* ─── Section Header ─── */
export function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="text-[10px] uppercase tracking-wider text-argus-text-muted font-semibold mt-3 mb-1.5">{children}</div>;
}

/* ─── Grade Badge ─── */
const gradeColors: Record<string, string> = {
  'A+': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  A: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  B: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  C: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  D: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  F: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
};

export function GradeBadge({ grade, size = 'md' }: { grade: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'text-2xl px-4 py-2' : size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';
  return (
    <span className={`inline-flex items-center font-bold rounded-lg border ${gradeColors[grade] ?? gradeColors['F']} ${sizeClass}`}>
      {grade}
    </span>
  );
}

/* ─── Status Pill ─── */
export function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${
      ok ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-emerald-400' : 'bg-rose-400'}`} />
      {label}
    </span>
  );
}

/* ─── Horizontal Bar ─── */
export function MiniBar({ value, max, color = 'cyan' }: { value: number; max: number; color?: 'cyan' | 'green' | 'red' | 'amber' }) {
  const pct = Math.min((value / max) * 100, 100);
  const colors = {
    cyan: 'from-argus-accent-cyan to-argus-accent-teal',
    green: 'from-emerald-400 to-emerald-500',
    red: 'from-rose-400 to-rose-500',
    amber: 'from-amber-400 to-amber-500',
  };
  return (
    <div className="h-1.5 bg-argus-card-border/40 rounded-full overflow-hidden">
      <div className={`h-full bg-gradient-to-r ${colors[color]} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
    </div>
  );
}

/* ─── Tag Chip ─── */
export function Tag({ children, variant = 'neutral' }: { children: ReactNode; variant?: 'cyan' | 'green' | 'red' | 'amber' | 'purple' | 'neutral' }) {
  const styles = {
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    red: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    purple: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    neutral: 'bg-argus-card text-argus-text-secondary border-argus-card-border',
  };
  return <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded border ${styles[variant]}`}>{children}</span>;
}

/* ─── Empty State ─── */
export function EmptyState({ message }: { message: string }) {
  return <p className="text-xs text-argus-text-muted italic py-2">{message}</p>;
}
