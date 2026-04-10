import type { CheckModule } from './index.js';
import { safeFetch, getErrorMessage } from '../utils/safeFetch.js';

export const globalRankingCheck: CheckModule = {
  id: 'global-ranking',
  name: 'Global Ranking',
  description: 'Retrieves domain popularity and traffic ranking data',
  category: 'content',
  icon: 'trending-up',
  run: async (target) => {
    const start = Date.now();
    try {
      if (target.isIP) {
        return { success: false, error: 'Ranking data requires a domain name', duration: Date.now() - start };
      }

      // Use Tranco ranking list (free, academic, no API key)
      let trancoRank: number | null = null;
      try {
        const trancoResponse = await safeFetch(
          `https://tranco-list.eu/api/ranks/domain/${target.hostname}`,
          { timeoutMs: 5000 },
        );
        if (trancoResponse.ok) {
          const trancoData = await trancoResponse.json() as Record<string, unknown>;
          const ranks = trancoData['ranks'] as Array<{ rank: number }> | undefined;
          if (ranks && ranks.length > 0) {
            trancoRank = ranks[0]!.rank;
          }
        }
      } catch {
        // Tranco unavailable
      }

      // Use Open PageRank (free API, no key needed for basic)
      let pageRank: number | null = null;
      try {
        const prResponse = await safeFetch(
          `https://openpagerank.com/api/v1.0/getPageRank?domains[]=${target.hostname}`,
          { timeoutMs: 5000 },
        );
        if (prResponse.ok) {
          const prData = await prResponse.json() as Record<string, unknown>;
          const results = prData['response'] as Array<{ page_rank_decimal: number }> | undefined;
          if (results && results.length > 0) {
            pageRank = results[0]!.page_rank_decimal;
          }
        }
      } catch {
        // PageRank unavailable
      }

      // Derive a tier label
      let tier: string;
      if (trancoRank !== null) {
        if (trancoRank <= 100) tier = 'Top 100 Global';
        else if (trancoRank <= 1000) tier = 'Top 1K Global';
        else if (trancoRank <= 10000) tier = 'Top 10K';
        else if (trancoRank <= 100000) tier = 'Top 100K';
        else if (trancoRank <= 1000000) tier = 'Top 1M';
        else tier = 'Long Tail';
      } else {
        tier = 'Unranked or Too New';
      }

      return {
        success: true,
        data: {
          trancoRank,
          pageRank,
          tier,
          domain: target.hostname,
        },
        duration: Date.now() - start,
      };
    } catch (error) {
      return { success: false, error: getErrorMessage(error), duration: Date.now() - start };
    }
  },
};
