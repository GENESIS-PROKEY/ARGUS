import type { CheckModule } from './index.js';
import { safeFetch, getErrorMessage } from '../utils/safeFetch.js';

export const relatedDomainsCheck: CheckModule = {
  id: 'related-domains',
  name: 'Related Domains',
  description: 'Discovers related domains through DNS cross-referencing and hosting analysis',
  category: 'dns',
  icon: 'git-merge',
  run: async (target) => {
    const start = Date.now();
    try {
      if (target.isIP) {
        return { success: false, error: 'Related domains lookup requires a domain name', duration: Date.now() - start };
      }

      // Use crt.sh to find related domains through shared SSL certificates
      const relatedDomains: Array<{ domain: string; source: string }> = [];
      const seen = new Set<string>();
      seen.add(target.hostname);

      try {
        const ctRes = await safeFetch(
          `https://crt.sh/?q=${target.hostname}&output=json`,
          { timeoutMs: 8000 },
        );
        if (ctRes.ok) {
          const ctData = await ctRes.json() as Array<{ name_value: string; issuer_name: string }>;
          for (const entry of ctData.slice(0, 100)) {
            const names = entry.name_value.split('\n');
            for (const name of names) {
              const cleaned = name.trim().replace(/^\*\./, '').toLowerCase();
              // Find different base domains (not subdomains of target)
              if (
                cleaned !== target.hostname &&
                !cleaned.endsWith(`.${target.hostname}`) &&
                !target.hostname.endsWith(`.${cleaned}`) &&
                cleaned.includes('.') &&
                !seen.has(cleaned)
              ) {
                seen.add(cleaned);
                relatedDomains.push({ domain: cleaned, source: 'shared-certificate' });
              }
            }
          }
        }
      } catch {
        // crt.sh may be slow
      }

      // Extract base domain for further analysis
      const parts = target.hostname.split('.');
      const baseDomain = parts.length > 2 ? parts.slice(-2).join('.') : target.hostname;

      // Check common TLD variations
      const tldVariations = ['.com', '.net', '.org', '.io', '.co', '.dev'];
      const nameWithoutTld = baseDomain.split('.')[0] ?? '';
      const currentTld = `.${parts.slice(-1).join('.')}`;

      for (const tld of tldVariations) {
        if (tld === currentTld) continue;
        const variantDomain = `${nameWithoutTld}${tld}`;
        if (!seen.has(variantDomain)) {
          seen.add(variantDomain);
          relatedDomains.push({ domain: variantDomain, source: 'tld-variation' });
        }
      }

      return {
        success: true,
        data: {
          relatedDomains: relatedDomains.slice(0, 50),
          totalFound: relatedDomains.length,
          baseDomain,
          sources: ['shared-certificate', 'tld-variation'],
        },
        duration: Date.now() - start,
      };
    } catch (error) {
      return { success: false, error: getErrorMessage(error), duration: Date.now() - start };
    }
  },
};
