import type { CheckModule } from './index.js';
import { getErrorMessage } from '../utils/safeFetch.js';
import { config } from '../config/index.js';

export const performanceCheck: CheckModule = {
  id: 'performance',
  name: 'Performance Metrics',
  description: 'Measures Time to First Byte (TTFB), page size, and response timing',
  category: 'performance',
  icon: 'gauge',
  run: async (target) => {
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), config.CHECK_TIMEOUT_MS);

      const fetchStart = Date.now();
      const response = await fetch(target.url, {
        method: 'GET',
        signal: controller.signal,
        headers: { 'User-Agent': 'ARGUS/1.0 Web Intelligence Scanner' },
      });
      const ttfb = Date.now() - fetchStart;

      const body = await response.arrayBuffer();
      const downloadTime = Date.now() - fetchStart - ttfb;
      clearTimeout(timer);

      const contentLength = body.byteLength;
      const headers: Record<string, string> = {};
      response.headers.forEach((v, k) => { headers[k] = v; });

      const contentEncoding = headers['content-encoding'] ?? 'none';
      const isCompressed = contentEncoding !== 'none';

      // Estimate transfer speed
      const transferSpeedKBps = downloadTime > 0 ? Math.round((contentLength / 1024) / (downloadTime / 1000)) : 0;

      // Grade TTFB
      let ttfbGrade: string;
      if (ttfb < 200) ttfbGrade = 'A+';
      else if (ttfb < 500) ttfbGrade = 'A';
      else if (ttfb < 1000) ttfbGrade = 'B';
      else if (ttfb < 2000) ttfbGrade = 'C';
      else if (ttfb < 3000) ttfbGrade = 'D';
      else ttfbGrade = 'F';

      return {
        success: true,
        data: {
          ttfb,
          ttfbGrade,
          totalLoadTime: Date.now() - fetchStart,
          downloadTime,
          pageSize: contentLength,
          pageSizeFormatted: contentLength > 1048576
            ? `${(contentLength / 1048576).toFixed(2)} MB`
            : `${(contentLength / 1024).toFixed(1)} KB`,
          compression: {
            encoding: contentEncoding,
            isCompressed,
          },
          transferSpeedKBps,
          statusCode: response.status,
        },
        duration: Date.now() - start,
      };
    } catch (error) {
      return { success: false, error: getErrorMessage(error), duration: Date.now() - start };
    }
  },
};
