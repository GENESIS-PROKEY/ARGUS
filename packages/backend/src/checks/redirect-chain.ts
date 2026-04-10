import type { CheckModule } from './index.js';
import { getErrorMessage } from '../utils/safeFetch.js';
import { config } from '../config/index.js';

interface RedirectHop {
  url: string;
  statusCode: number;
  statusText: string;
  headers: Record<string, string>;
}

export const redirectChainCheck: CheckModule = {
  id: 'redirect-chain',
  name: 'Redirect Chain',
  description: 'Traces the full redirect path from the initial URL to the final destination',
  category: 'network',
  icon: 'route',
  run: async (target) => {
    const start = Date.now();
    try {
      const chain: RedirectHop[] = [];
      let currentUrl = target.url;
      const maxRedirects = 10;
      const visited = new Set<string>();

      for (let i = 0; i < maxRedirects; i++) {
        if (visited.has(currentUrl)) {
          chain.push({ url: currentUrl, statusCode: 0, statusText: 'Redirect loop detected', headers: {} });
          break;
        }
        visited.add(currentUrl);

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), config.CHECK_TIMEOUT_MS);

        try {
          const response = await fetch(currentUrl, {
            method: 'GET',
            redirect: 'manual',
            signal: controller.signal,
            headers: { 'User-Agent': 'ARGUS/1.0 Web Intelligence Scanner' },
          });

          clearTimeout(timer);

          const headers: Record<string, string> = {};
          response.headers.forEach((v, k) => { headers[k] = v; });

          chain.push({
            url: currentUrl,
            statusCode: response.status,
            statusText: response.statusText,
            headers: {
              ...(headers['location'] ? { location: headers['location'] } : {}),
              ...(headers['server'] ? { server: headers['server'] } : {}),
            },
          });

          if (response.status >= 300 && response.status < 400) {
            const location = response.headers.get('location');
            if (!location) break;
            currentUrl = location.startsWith('http') ? location : new URL(location, currentUrl).href;
          } else {
            break;
          }
        } catch {
          clearTimeout(timer);
          break;
        }
      }

      const hasHttpUpgrade = chain.some((hop, i) => {
        if (i === 0) return false;
        const prev = chain[i - 1];
        return prev?.url.startsWith('http://') && hop.url.startsWith('https://');
      });

      return {
        success: true,
        data: {
          chain,
          hops: chain.length,
          finalUrl: chain[chain.length - 1]?.url ?? currentUrl,
          hasHttpToHttpsUpgrade: hasHttpUpgrade,
          hasRedirects: chain.length > 1,
        },
        duration: Date.now() - start,
      };
    } catch (error) {
      return { success: false, error: getErrorMessage(error), duration: Date.now() - start };
    }
  },
};
