import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ScanHistoryEntry {
  id: string;
  domain: string;
  timestamp: number;
  duration: number;
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  /** Stores serialized check results for export/review */
  results: Record<string, { name: string; success: boolean; data?: unknown; error?: string; duration?: number }>;
}

interface HistoryState {
  entries: ScanHistoryEntry[];
  maxEntries: number;
  addEntry: (entry: ScanHistoryEntry) => void;
  removeEntry: (id: string) => void;
  clearHistory: () => void;
  getEntry: (id: string) => ScanHistoryEntry | undefined;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      entries: [],
      maxEntries: 50,

      addEntry: (entry) => {
        set((state) => {
          // Deduplicate: if same domain scanned within 30s, replace
          const filtered = state.entries.filter(
            (e) => !(e.domain === entry.domain && Math.abs(e.timestamp - entry.timestamp) < 30000),
          );
          const updated = [entry, ...filtered].slice(0, state.maxEntries);
          return { entries: updated };
        });
      },

      removeEntry: (id) => {
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== id),
        }));
      },

      clearHistory: () => set({ entries: [] }),

      getEntry: (id) => get().entries.find((e) => e.id === id),
    }),
    {
      name: 'argus-scan-history',
      version: 1,
    },
  ),
);
