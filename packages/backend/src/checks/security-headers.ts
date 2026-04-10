import type { CheckModule } from './index.js';
import { safeFetch, getErrorMessage } from '../utils/safeFetch.js';

interface HeaderAudit {
  header: string;
  present: boolean;
  value: string | null;
  recommendation: string;
  severity: 'good' | 'warning' | 'critical';
  mdnLink: string;
}

const SECURITY_HEADERS: Array<{
  header: string;
  recommendation: string;
  mdnLink: string;
  check: (value: string | null) => 'good' | 'warning' | 'critical';
}> = [
  {
    header: 'strict-transport-security',
    recommendation: 'Set max-age to at least 31536000 (1 year) and include subdomains',
    mdnLink: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security',
    check: (v) => {
      if (!v) return 'critical';
      const maxAge = parseInt(v.match(/max-age=(\d+)/)?.[1] ?? '0', 10);
      return maxAge >= 31536000 ? 'good' : 'warning';
    },
  },
  {
    header: 'content-security-policy',
    recommendation: 'Define a strict CSP to prevent XSS and injection attacks',
    mdnLink: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP',
    check: (v) => (v ? 'good' : 'critical'),
  },
  {
    header: 'x-content-type-options',
    recommendation: 'Set to "nosniff" to prevent MIME-type sniffing',
    mdnLink: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options',
    check: (v) => (v?.toLowerCase() === 'nosniff' ? 'good' : 'warning'),
  },
  {
    header: 'x-frame-options',
    recommendation: 'Set to "DENY" or "SAMEORIGIN" to prevent clickjacking',
    mdnLink: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options',
    check: (v) => (v ? 'good' : 'warning'),
  },
  {
    header: 'x-xss-protection',
    recommendation: 'Set to "0" (modern browsers) or rely on CSP instead',
    mdnLink: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection',
    check: (v) => (v ? 'good' : 'warning'),
  },
  {
    header: 'referrer-policy',
    recommendation: 'Set to "strict-origin-when-cross-origin" or more restrictive',
    mdnLink: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy',
    check: (v) => (v ? 'good' : 'warning'),
  },
  {
    header: 'permissions-policy',
    recommendation: 'Restrict browser features like camera, microphone, geolocation',
    mdnLink: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy',
    check: (v) => (v ? 'good' : 'warning'),
  },
  {
    header: 'cross-origin-embedder-policy',
    recommendation: 'Set to "require-corp" for cross-origin isolation',
    mdnLink: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Embedder-Policy',
    check: (v) => (v ? 'good' : 'warning'),
  },
  {
    header: 'cross-origin-opener-policy',
    recommendation: 'Set to "same-origin" to prevent cross-origin access',
    mdnLink: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Opener-Policy',
    check: (v) => (v ? 'good' : 'warning'),
  },
  {
    header: 'cross-origin-resource-policy',
    recommendation: 'Set to "same-origin" or "cross-origin" as needed',
    mdnLink: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Resource-Policy',
    check: (v) => (v ? 'good' : 'warning'),
  },
];

export const securityHeadersCheck: CheckModule = {
  id: 'security-headers',
  name: 'Security Headers',
  description: 'Audits HTTP security headers against best practices (CSP, HSTS, X-Frame-Options, etc.)',
  category: 'security',
  icon: 'shield-check',
  run: async (target) => {
    const start = Date.now();
    try {
      const response = await safeFetch(target.url, { method: 'HEAD' });

      const audits: HeaderAudit[] = SECURITY_HEADERS.map((sh) => {
        const value = response.headers.get(sh.header);
        return {
          header: sh.header,
          present: value !== null,
          value,
          recommendation: sh.recommendation,
          severity: sh.check(value),
          mdnLink: sh.mdnLink,
        };
      });

      const good = audits.filter((a) => a.severity === 'good').length;
      const warnings = audits.filter((a) => a.severity === 'warning').length;
      const critical = audits.filter((a) => a.severity === 'critical').length;
      const score = Math.round((good / audits.length) * 100);

      let grade: string;
      if (score >= 90) grade = 'A';
      else if (score >= 70) grade = 'B';
      else if (score >= 50) grade = 'C';
      else if (score >= 30) grade = 'D';
      else grade = 'F';

      return {
        success: true,
        data: {
          audits,
          score,
          grade,
          good,
          warnings,
          critical,
          total: audits.length,
        },
        duration: Date.now() - start,
      };
    } catch (error) {
      return { success: false, error: getErrorMessage(error), duration: Date.now() - start };
    }
  },
};
