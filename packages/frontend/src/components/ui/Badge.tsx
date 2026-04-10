import type { ReactNode } from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-argus-success/10 text-argus-success border-argus-success/20',
  warning: 'bg-argus-warning/10 text-argus-warning border-argus-warning/20',
  danger: 'bg-argus-danger/10 text-argus-danger border-argus-danger/20',
  info: 'bg-argus-accent-cyan/10 text-argus-accent-cyan border-argus-accent-cyan/20',
  neutral: 'bg-argus-card text-argus-text-secondary border-argus-card-border',
};

export function Badge({ variant = 'neutral', children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border ${variantStyles[variant]}`}
    >
      {children}
    </span>
  );
}

type GradeValue = 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';

const gradeVariant: Record<GradeValue, BadgeVariant> = {
  'A+': 'success',
  A: 'success',
  B: 'info',
  C: 'warning',
  D: 'danger',
  F: 'danger',
};

export function GradeBadge({ grade }: { grade: GradeValue }) {
  return <Badge variant={gradeVariant[grade]}>{grade}</Badge>;
}
