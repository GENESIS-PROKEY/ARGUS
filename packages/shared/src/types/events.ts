import type { CheckResult } from './checks.js';
import type { ParsedTarget } from './target.js';
import type { SecurityScore } from './scoring.js';

export interface ScanStartEvent {
  type: 'scan:start';
  scanId: string;
  target: ParsedTarget;
  totalChecks: number;
  timestamp: number;
}

export interface CheckStartEvent {
  type: 'check:start';
  scanId: string;
  checkId: string;
  checkName: string;
  timestamp: number;
}

export interface CheckCompleteEvent {
  type: 'check:complete';
  scanId: string;
  checkId: string;
  checkName: string;
  result: CheckResult;
  completedCount: number;
  totalChecks: number;
  timestamp: number;
}

export interface ScanCompleteEvent {
  type: 'scan:complete';
  scanId: string;
  totalDuration: number;
  completedChecks: number;
  failedChecks: number;
  score?: SecurityScore;
  timestamp: number;
}

export interface ScanErrorEvent {
  type: 'scan:error';
  scanId: string;
  error: string;
  timestamp: number;
}

export type ScanEvent =
  | ScanStartEvent
  | CheckStartEvent
  | CheckCompleteEvent
  | ScanCompleteEvent
  | ScanErrorEvent;

export type ScanEventType = ScanEvent['type'];
