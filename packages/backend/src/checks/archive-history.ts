import type { CheckModule } from './index.js';
import { safeFetch, getErrorMessage } from '../utils/safeFetch.js';

export const archiveHistoryCheck: CheckModule = {
  id: 'archive-history',
  name: 'Archive History',
  description: 'Checks the Wayback Machine for historical snapshots of the site',
  category: 'content',
  icon: 'history',
  run: async (target) => {
    const start = Date.now();
    try {
      // Wayback Machine CDX API
      const cdxResponse = await safeFetch(
        `https://web.archive.org/cdx/search/cdx?url=${target.hostname}&output=json&limit=1&fl=timestamp&sort=asc`,
        { timeoutMs: 8000 },
      );

      let firstSnapshot: string | null = null;
      if (cdxResponse.ok) {
        const cdxData = await cdxResponse.json() as string[][];
        if (cdxData.length > 1 && cdxData[1]?.[0]) {
          const ts = cdxData[1][0];
          firstSnapshot = `${ts.slice(0, 4)}-${ts.slice(4, 6)}-${ts.slice(6, 8)}`;
        }
      }

      // Get latest snapshot
      const latestResponse = await safeFetch(
        `https://web.archive.org/cdx/search/cdx?url=${target.hostname}&output=json&limit=1&fl=timestamp&sort=desc`,
        { timeoutMs: 8000 },
      );

      let latestSnapshot: string | null = null;
      if (latestResponse.ok) {
        const latestData = await latestResponse.json() as string[][];
        if (latestData.length > 1 && latestData[1]?.[0]) {
          const ts = latestData[1][0];
          latestSnapshot = `${ts.slice(0, 4)}-${ts.slice(4, 6)}-${ts.slice(6, 8)}`;
        }
      }

      // Get total snapshot count
      const countResponse = await safeFetch(
        `https://web.archive.org/cdx/search/cdx?url=${target.hostname}/*&output=json&limit=0&showNumPages=true`,
        { timeoutMs: 8000 },
      );

      let totalPages = 0;
      if (countResponse.ok) {
        const countText = await countResponse.text();
        totalPages = parseInt(countText.trim(), 10) || 0;
      }

      // Availability API
      const availResponse = await safeFetch(
        `https://archive.org/wayback/available?url=${target.hostname}`,
        { timeoutMs: 5000 },
      );
      let closestSnapshot: unknown = null;
      if (availResponse.ok) {
        const availData = await availResponse.json() as Record<string, unknown>;
        const snapshots = availData['archived_snapshots'] as Record<string, unknown> | undefined;
        closestSnapshot = snapshots?.['closest'] ?? null;
      }

      const archiveUrl = `https://web.archive.org/web/*/${target.hostname}`;

      return {
        success: true,
        data: {
          firstSnapshot,
          latestSnapshot,
          estimatedSnapshots: totalPages,
          closestSnapshot,
          archiveUrl,
          hasHistory: firstSnapshot !== null,
        },
        duration: Date.now() - start,
      };
    } catch (error) {
      return { success: false, error: getErrorMessage(error), duration: Date.now() - start };
    }
  },
};
