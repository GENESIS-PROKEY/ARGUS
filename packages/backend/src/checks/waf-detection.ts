import type { CheckModule } from './index.js';
import { safeFetch, getErrorMessage } from '../utils/safeFetch.js';

interface WafSignature {
  name: string;
  headers?: Record<string, RegExp>;
  bodyPatterns?: RegExp[];
}

const WAF_SIGNATURES: WafSignature[] = [
  { name: 'Cloudflare', headers: { server: /cloudflare/i, 'cf-ray': /.*/ } },
  { name: 'AWS WAF', headers: { 'x-amzn-requestid': /.*/, 'x-amz-cf-id': /.*/ } },
  { name: 'Akamai', headers: { 'x-akamai-transformed': /.*/, server: /akamai/i } },
  { name: 'Sucuri', headers: { server: /sucuri/i, 'x-sucuri-id': /.*/ } },
  { name: 'Imperva / Incapsula', headers: { 'x-cdn': /incapsula|imperva/i, 'x-iinfo': /.*/ } },
  { name: 'F5 BIG-IP', headers: { server: /big-?ip/i, 'x-cnection': /.*/ } },
  { name: 'Barracuda', headers: { server: /barracuda/i } },
  { name: 'DDoS-Guard', headers: { server: /ddos-guard/i } },
  { name: 'Fastly', headers: { 'x-fastly-request-id': /.*/, via: /fastly/i } },
  { name: 'StackPath', headers: { 'x-sp-url': /.*/, server: /stackpath/i } },
  { name: 'Fortinet / FortiWeb', headers: { server: /fortiweb/i } },
  { name: 'Wordfence', headers: { server: /wordfence/i } },
  { name: 'ModSecurity', headers: { server: /mod_security|modsecurity/i } },
  { name: 'AWS CloudFront', headers: { server: /cloudfront/i, via: /cloudfront/i, 'x-amz-cf-pop': /.*/ } },
  { name: 'Google Cloud Armor', headers: { server: /gws|google/i } },
  { name: 'Azure Front Door', headers: { 'x-azure-ref': /.*/ } },
  { name: 'Vercel', headers: { server: /vercel/i, 'x-vercel-id': /.*/ } },
];

export const wafDetectionCheck: CheckModule = {
  id: 'waf-detection',
  name: 'WAF / Firewall Detection',
  description: 'Identifies Web Application Firewalls and CDN protection layers',
  category: 'security',
  icon: 'shield',
  run: async (target) => {
    const start = Date.now();
    try {
      const response = await safeFetch(target.url);
      const headers: Record<string, string> = {};
      response.headers.forEach((v, k) => { headers[k] = v; });

      const detected: Array<{ name: string; evidence: string[] }> = [];

      for (const sig of WAF_SIGNATURES) {
        const evidence: string[] = [];

        if (sig.headers) {
          for (const [header, pattern] of Object.entries(sig.headers)) {
            const value = headers[header];
            if (value && pattern.test(value)) {
              evidence.push(`${header}: ${value}`);
            }
          }
        }

        if (evidence.length > 0) {
          detected.push({ name: sig.name, evidence });
        }
      }

      return {
        success: true,
        data: {
          detected,
          hasWaf: detected.length > 0,
          count: detected.length,
          allHeaders: headers,
        },
        duration: Date.now() - start,
      };
    } catch (error) {
      return { success: false, error: getErrorMessage(error), duration: Date.now() - start };
    }
  },
};
