import type { CheckModule } from './index.js';
import { getErrorMessage } from '../utils/safeFetch.js';

/**
 * Breach Check — Domain data breach lookup.
 * This check provides awareness about known data breaches.
 * Since HIBP requires a paid API key, this returns an informational
 * "premium feature" state rather than requiring configuration.
 */
export const breachCheckCheck: CheckModule = {
  id: 'breach-check',
  name: 'Data Breach Check',
  description: 'Checks if the domain has appeared in known data breaches',
  category: 'security',
  icon: 'shield-alert',
  run: async (_target) => {
    const start = Date.now();
    try {
      // HIBP requires a paid API key ($3.50/mo) — return informational state
      return {
        success: true,
        data: {
          available: false,
          breachCount: 0,
          breaches: [],
          requiresApiKey: true,
          note: 'Domain breach data requires a HaveIBeenPwned API subscription. Visit haveibeenpwned.com/API/Key for access.',
          grade: 'INFO',
        },
        duration: Date.now() - start,
      };
    } catch (error) {
      return { success: false, error: getErrorMessage(error), duration: Date.now() - start };
    }
  },
};
