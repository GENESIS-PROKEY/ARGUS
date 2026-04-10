export type CheckCategory =
  | 'network'
  | 'security'
  | 'dns'
  | 'content'
  | 'performance'
  | 'threats'
  | 'infrastructure'
  | 'email';

export interface CheckMeta {
  id: string;
  name: string;
  description: string;
  category: CheckCategory;
  icon: string;
}

export interface CheckResult {
  success: boolean;
  data?: unknown;
  error?: string;
  duration: number;
  cached?: boolean;
}

export type CheckStatusState = 'pending' | 'running' | 'success' | 'error' | 'timeout';

export interface CheckStatus {
  id: string;
  name: string;
  category: CheckCategory;
  icon: string;
  status: CheckStatusState;
  result?: CheckResult;
}
