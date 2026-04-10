import type { CheckModule } from './index.js';
import { safeFetch, getErrorMessage } from '../utils/safeFetch.js';

export const screenshotCheck: CheckModule = {
  id: 'screenshot',
  name: 'Site Screenshot',
  description: 'Captures a visual screenshot of the website using a third-party rendering API',
  category: 'content',
  icon: 'camera',
  run: async (target) => {
    const start = Date.now();
    try {
      // Strategy 1: Google PageSpeed Insights (free, no key needed)
      const psiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeedTest?url=${encodeURIComponent(target.url)}&category=performance&strategy=desktop`;

      const response = await safeFetch(psiUrl, { timeoutMs: 30000 });

      if (response.ok) {
        const data = await response.json() as Record<string, unknown>;
        const lighthouse = data['lighthouseResult'] as Record<string, unknown> | undefined;
        const audits = lighthouse?.['audits'] as Record<string, unknown> | undefined;
        const screenshotAudit = audits?.['final-screenshot'] as Record<string, unknown> | undefined;
        const details = screenshotAudit?.['details'] as Record<string, unknown> | undefined;
        const screenshotData = details?.['data'] as string | undefined;

        // Also extract performance score
        const categories = lighthouse?.['categories'] as Record<string, unknown> | undefined;
        const perfCategory = categories?.['performance'] as Record<string, unknown> | undefined;
        const perfScore = perfCategory?.['score'] as number | undefined;

        if (screenshotData) {
          return {
            success: true,
            data: {
              screenshotUrl: screenshotData,
              isBase64: true,
              source: 'pagespeed-insights',
              domain: target.hostname,
              performanceScore: perfScore !== undefined ? Math.round(perfScore * 100) : null,
            },
            duration: Date.now() - start,
          };
        }
      }

      // Strategy 2: Microlink API (free tier, returns a screenshot URL)
      try {
        const microlinkUrl = `https://api.microlink.io/?url=${encodeURIComponent(target.url)}&screenshot=true&meta=false&embed=screenshot.url`;
        const mlRes = await safeFetch(microlinkUrl, { timeoutMs: 15000 });
        if (mlRes.ok) {
          const mlData = await mlRes.json() as Record<string, unknown>;
          const dataObj = mlData['data'] as Record<string, unknown> | undefined;
          const screenshot = dataObj?.['screenshot'] as Record<string, string> | undefined;
          if (screenshot?.['url']) {
            return {
              success: true,
              data: {
                screenshotUrl: screenshot['url'],
                isBase64: false,
                source: 'microlink',
                domain: target.hostname,
                performanceScore: null,
              },
              duration: Date.now() - start,
            };
          }
        }
      } catch {
        // ignore
      }

      // Strategy 3: Return a thumbnail URL that the frontend can try
      // Using Google's cache as a thumbnail service
      return {
        success: true,
        data: {
          screenshotUrl: `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${target.hostname}&size=128`,
          isBase64: false,
          source: 'favicon-fallback',
          domain: target.hostname,
          performanceScore: null,
          message: 'Full screenshot unavailable — showing favicon. Expand card for live site preview.',
        },
        duration: Date.now() - start,
      };
    } catch (error) {
      return { success: false, error: getErrorMessage(error), duration: Date.now() - start };
    }
  },
};
