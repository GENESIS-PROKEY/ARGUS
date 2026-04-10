import type { CheckModule } from './index.js';
import { safeFetch, getErrorMessage } from '../utils/safeFetch.js';

export const hstsPreloadCheck: CheckModule = {
  id: 'hsts-preload',
  name: 'HSTS Preload Status',
  description: 'Checks if the domain is on the HSTS preload list for enforced HTTPS',
  category: 'security',
  icon: 'lock',
  run: async (target) => {
    const start = Date.now();
    try {
      if (target.isIP) {
        return { success: false, error: 'HSTS preload check requires a domain name', duration: Date.now() - start };
      }

      // Check Chrome's HSTS preload list API
      const preloadRes = await safeFetch(
        `https://hstspreload.org/api/v2/status?domain=${target.hostname}`,
        { timeoutMs: 5000 },
      );

      let preloadStatus: Record<string, unknown> = {};
      if (preloadRes.ok) {
        preloadStatus = await preloadRes.json() as Record<string, unknown>;
      }

      // Also check the actual HSTS header
      let hstsHeader: string | null = null;
      let hstsAnalysis: Record<string, unknown> = {};
      try {
        const headRes = await safeFetch(target.url, { method: 'HEAD', timeoutMs: 5000 });
        hstsHeader = headRes.headers.get('strict-transport-security');

        if (hstsHeader) {
          const maxAgeMatch = hstsHeader.match(/max-age=(\d+)/i);
          const maxAge = maxAgeMatch ? parseInt(maxAgeMatch[1]!, 10) : 0;
          const includeSubdomains = /includeSubDomains/i.test(hstsHeader);
          const preloadDirective = /preload/i.test(hstsHeader);

          hstsAnalysis = {
            maxAge,
            maxAgeYears: (maxAge / (365 * 24 * 60 * 60)).toFixed(1),
            includeSubdomains,
            preloadDirective,
            meetsPreloadRequirements: maxAge >= 31536000 && includeSubdomains && preloadDirective,
          };
        }
      } catch {
        // ignore
      }

      const isPreloaded = preloadStatus['status'] === 'preloaded';
      const isPending = preloadStatus['status'] === 'pending';

      return {
        success: true,
        data: {
          preloadStatus: preloadStatus['status'] ?? 'unknown',
          isPreloaded,
          isPending,
          hstsHeader,
          hstsAnalysis,
          eligibleForPreload: hstsAnalysis['meetsPreloadRequirements'] === true,
          preloadListUrl: `https://hstspreload.org/?domain=${target.hostname}`,
        },
        duration: Date.now() - start,
      };
    } catch (error) {
      return { success: false, error: getErrorMessage(error), duration: Date.now() - start };
    }
  },
};
