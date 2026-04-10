import { create } from 'zustand';
import type { CheckStatus, CheckResult, ParsedTarget } from '@argus/shared';

interface ScanState {
  scanId: string | null;
  domain: string | null;
  target: ParsedTarget | null;
  status: 'idle' | 'connecting' | 'scanning' | 'complete' | 'error';
  checks: Map<string, CheckStatus>;
  totalChecks: number;
  completedChecks: number;
  failedChecks: number;
  totalDuration: number;
  error: string | null;
  eventSource: EventSource | null;

  startScan: (domain: string) => void;
  reset: () => void;
  setCheckResult: (checkId: string, result: CheckResult) => void;
}

export const useScanStore = create<ScanState>((set, get) => ({
  scanId: null,
  domain: null,
  target: null,
  status: 'idle',
  checks: new Map(),
  totalChecks: 0,
  completedChecks: 0,
  failedChecks: 0,
  totalDuration: 0,
  error: null,
  eventSource: null,

  startScan: (domain: string) => {
    const prev = get().eventSource;
    if (prev) prev.close();

    set({ status: 'connecting', domain, error: null });

    const es = new EventSource(`/api/v1/scan?url=${encodeURIComponent(domain)}`);

    es.addEventListener('scan:start', (e: MessageEvent) => {
      const data = JSON.parse(e.data as string) as {
        scanId: string;
        target: ParsedTarget;
        totalChecks: number;
      };
      set({
        scanId: data.scanId,
        target: data.target,
        totalChecks: data.totalChecks,
        status: 'scanning',
      });
    });

    es.addEventListener('check:start', (e: MessageEvent) => {
      const data = JSON.parse(e.data as string) as {
        checkId: string;
        checkName: string;
      };
      set((state) => {
        const checks = new Map(state.checks);
        checks.set(data.checkId, {
          id: data.checkId,
          name: data.checkName,
          category: 'network',
          icon: 'activity',
          status: 'running',
        });
        return { checks };
      });
    });

    es.addEventListener('check:complete', (e: MessageEvent) => {
      const data = JSON.parse(e.data as string) as {
        checkId: string;
        checkName: string;
        result: CheckResult;
        completedCount: number;
        totalChecks: number;
      };
      set((state) => {
        const checks = new Map(state.checks);
        checks.set(data.checkId, {
          id: data.checkId,
          name: data.checkName,
          category: 'network',
          icon: 'activity',
          status: data.result.success ? 'success' : 'error',
          result: data.result,
        });
        return {
          checks,
          completedChecks: data.completedCount,
          totalChecks: data.totalChecks,
        };
      });
    });

    es.addEventListener('scan:complete', (e: MessageEvent) => {
      const data = JSON.parse(e.data as string) as {
        totalDuration: number;
        completedChecks: number;
        failedChecks: number;
      };
      set({
        status: 'complete',
        totalDuration: data.totalDuration,
        completedChecks: data.completedChecks,
        failedChecks: data.failedChecks,
      });
      es.close();

      // Save to history
      const state = get();
      if (state.scanId && state.domain) {
        const results: Record<string, { name: string; success: boolean; data?: unknown; error?: string; duration?: number }> = {};
        state.checks.forEach((check, id) => {
          results[id] = {
            name: check.name,
            success: check.result?.success ?? false,
            data: check.result?.data,
            error: check.result?.error,
            duration: check.result?.duration,
          };
        });

        import('../stores/historyStore').then(({ useHistoryStore }) => {
          useHistoryStore.getState().addEntry({
            id: state.scanId!,
            domain: state.domain!,
            timestamp: Date.now(),
            duration: data.totalDuration,
            totalChecks: data.completedChecks,
            passedChecks: data.completedChecks - data.failedChecks,
            failedChecks: data.failedChecks,
            results,
          });
        });
      }
    });

    es.addEventListener('scan:error', (e: MessageEvent) => {
      const data = JSON.parse(e.data as string) as { error: string };
      set({ status: 'error', error: data.error });
      es.close();
    });

    es.onerror = () => {
      if (get().status === 'scanning') {
        set({ status: 'error', error: 'Connection lost. Please try again.' });
      }
      es.close();
    };

    set({ eventSource: es });
  },

  reset: () => {
    const prev = get().eventSource;
    if (prev) prev.close();
    set({
      scanId: null,
      domain: null,
      target: null,
      status: 'idle',
      checks: new Map(),
      totalChecks: 0,
      completedChecks: 0,
      failedChecks: 0,
      totalDuration: 0,
      error: null,
      eventSource: null,
    });
  },

  setCheckResult: (checkId: string, result: CheckResult) => {
    set((state) => {
      const checks = new Map(state.checks);
      const existing = checks.get(checkId);
      if (existing) {
        checks.set(checkId, { ...existing, result, status: result.success ? 'success' : 'error' });
      }
      return { checks };
    });
  },
}));
