import type { CheckModule } from './index.js';
import { safeFetch, getErrorMessage } from '../utils/safeFetch.js';

export const httpHeadersCheck: CheckModule = {
  id: 'http-headers',
  name: 'HTTP Headers',
  description: 'Inspects all HTTP response headers returned by the server',
  category: 'network',
  icon: 'file-text',
  run: async (target) => {
    const start = Date.now();
    try {
      const response = await safeFetch(target.url, { method: 'HEAD' });

      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      return {
        success: true,
        data: {
          statusCode: response.status,
          statusText: response.statusText,
          headers,
          headerCount: Object.keys(headers).length,
          server: headers['server'] ?? null,
          poweredBy: headers['x-powered-by'] ?? null,
          contentType: headers['content-type'] ?? null,
        },
        duration: Date.now() - start,
      };
    } catch (error) {
      return { success: false, error: getErrorMessage(error), duration: Date.now() - start };
    }
  },
};
