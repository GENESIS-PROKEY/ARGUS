import type { CheckModule } from './index.js';
import { safeFetch, getErrorMessage } from '../utils/safeFetch.js';

interface CdnSignature {
  provider: string;
  headerChecks: Array<{ header: string; pattern: RegExp }>;
}

const CDN_SIGNATURES: CdnSignature[] = [
  { provider: 'Cloudflare', headerChecks: [
    { header: 'cf-ray', pattern: /.+/ },
    { header: 'server', pattern: /cloudflare/i },
    { header: 'cf-cache-status', pattern: /.+/ },
  ]},
  { provider: 'Fastly', headerChecks: [
    { header: 'x-served-by', pattern: /cache-/i },
    { header: 'x-cache', pattern: /fastly/i },
    { header: 'via', pattern: /varnish/i },
  ]},
  { provider: 'Akamai', headerChecks: [
    { header: 'x-check-cacheable', pattern: /.+/ },
    { header: 'via', pattern: /akamai/i },
    { header: 'x-akamai-transformed', pattern: /.+/ },
  ]},
  { provider: 'AWS CloudFront', headerChecks: [
    { header: 'x-amz-cf-id', pattern: /.+/ },
    { header: 'x-amz-cf-pop', pattern: /.+/ },
    { header: 'via', pattern: /CloudFront/i },
  ]},
  { provider: 'Azure CDN', headerChecks: [
    { header: 'x-azure-ref', pattern: /.+/ },
    { header: 'x-ms-ref', pattern: /.+/ },
  ]},
  { provider: 'Vercel', headerChecks: [
    { header: 'x-vercel-id', pattern: /.+/ },
    { header: 'server', pattern: /vercel/i },
  ]},
  { provider: 'Netlify', headerChecks: [
    { header: 'x-nf-request-id', pattern: /.+/ },
    { header: 'server', pattern: /netlify/i },
  ]},
  { provider: 'Bunny CDN', headerChecks: [
    { header: 'cdn-pullzone', pattern: /.+/ },
    { header: 'server', pattern: /bunny/i },
  ]},
  { provider: 'Sucuri', headerChecks: [
    { header: 'x-sucuri-id', pattern: /.+/ },
    { header: 'server', pattern: /sucuri/i },
  ]},
  { provider: 'Google Cloud CDN', headerChecks: [
    { header: 'via', pattern: /google/i },
    { header: 'server', pattern: /gws/i },
  ]},
];

export const cdnDetectionCheck: CheckModule = {
  id: 'cdn-detection',
  name: 'CDN Detection',
  description: 'Detects content delivery network (CDN) provider from response headers',
  category: 'infrastructure',
  icon: 'globe',
  run: async (target) => {
    const start = Date.now();
    try {
      const response = await safeFetch(target.url, {
        timeoutMs: 8000,
        headers: { 'User-Agent': 'ARGUS/1.0' },
      });

      if (!response.ok) {
        return { success: false, error: `Failed to fetch: ${response.status}`, duration: Date.now() - start };
      }

      const evidence: string[] = [];
      let detectedProvider: string | null = null;
      let matchCount = 0;

      for (const sig of CDN_SIGNATURES) {
        let hits = 0;
        for (const check of sig.headerChecks) {
          const value = response.headers.get(check.header);
          if (value && check.pattern.test(value)) {
            hits++;
            evidence.push(`${check.header}: ${value}`);
          }
        }
        if (hits > matchCount) {
          matchCount = hits;
          detectedProvider = sig.provider;
        }
      }

      let confidence: 'high' | 'medium' | 'low' | 'none' = 'none';
      if (matchCount >= 2) confidence = 'high';
      else if (matchCount === 1) confidence = 'medium';

      return {
        success: true,
        data: {
          detected: detectedProvider !== null,
          provider: detectedProvider,
          confidence,
          evidence: evidence.slice(0, 10),
          grade: 'INFO',
        },
        duration: Date.now() - start,
      };
    } catch (error) {
      return { success: false, error: getErrorMessage(error), duration: Date.now() - start };
    }
  },
};
