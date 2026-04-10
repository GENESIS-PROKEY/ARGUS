import type { CheckModule } from './index.js';
import { safeFetch, getErrorMessage } from '../utils/safeFetch.js';
import { config } from '../config/index.js';

export const safeBrowsingCheck: CheckModule = {
  id: 'safe-browsing',
  name: 'Google Safe Browsing',
  description: 'Checks the URL against Google\'s Safe Browsing malware and phishing database',
  category: 'threats',
  icon: 'alert-triangle',
  run: async (target) => {
    const start = Date.now();
    try {
      if (!config.GOOGLE_SAFE_BROWSING_KEY) {
        return {
          success: true,
          data: { available: false, reason: 'Google Safe Browsing API key not configured' },
          duration: Date.now() - start,
        };
      }

      const requestBody = {
        client: {
          clientId: 'argus',
          clientVersion: '1.0.0',
        },
        threatInfo: {
          threatTypes: [
            'MALWARE',
            'SOCIAL_ENGINEERING',
            'UNWANTED_SOFTWARE',
            'POTENTIALLY_HARMFUL_APPLICATION',
          ],
          platformTypes: ['ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries: [
            { url: target.url },
            { url: `http://${target.hostname}` },
            { url: `https://${target.hostname}` },
          ],
        },
      };

      const response = await safeFetch(
        `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${config.GOOGLE_SAFE_BROWSING_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
          timeoutMs: 10000,
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `Safe Browsing API error: ${response.status} — ${errorText.slice(0, 200)}`,
          duration: Date.now() - start,
        };
      }

      const data = await response.json() as Record<string, unknown>;
      const matches = data['matches'] as Array<Record<string, unknown>> | undefined;
      const hasThreats = matches !== undefined && matches.length > 0;

      const threats = hasThreats
        ? matches.map((m) => ({
            type: m['threatType'] as string,
            platform: m['platformType'] as string,
            url: (m['threat'] as Record<string, unknown>)?.['url'] as string,
          }))
        : [];

      return {
        success: true,
        data: {
          available: true,
          isSafe: !hasThreats,
          threats,
          threatCount: threats.length,
          checkedUrls: [target.url, `http://${target.hostname}`, `https://${target.hostname}`],
        },
        duration: Date.now() - start,
      };
    } catch (error) {
      return { success: false, error: getErrorMessage(error), duration: Date.now() - start };
    }
  },
};
