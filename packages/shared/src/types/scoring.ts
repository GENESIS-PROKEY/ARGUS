export type SecurityGrade = 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';

export interface ScoreBreakdown {
  category: string;
  label: string;
  maxPoints: number;
  earnedPoints: number;
  status: 'pass' | 'fail' | 'partial' | 'unknown';
  details: string;
}

export interface SecurityScore {
  total: number;
  maxPossible: number;
  grade: SecurityGrade;
  breakdown: ScoreBreakdown[];
}
