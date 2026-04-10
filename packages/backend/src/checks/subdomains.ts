import dns from 'node:dns';
import { promisify } from 'node:util';
import type { CheckModule } from './index.js';
import { safeFetch, getErrorMessage } from '../utils/safeFetch.js';

const resolve4 = promisify(dns.resolve4);

const COMMON_SUBDOMAINS = [
  'www', 'mail', 'ftp', 'admin', 'webmail', 'smtp', 'pop', 'imap',
  'blog', 'dev', 'staging', 'api', 'app', 'cdn', 'docs', 'help',
  'shop', 'store', 'portal', 'test', 'beta', 'demo', 'support',
  'forum', 'wiki', 'git', 'vpn', 'remote', 'cloud', 'media',
  'static', 'assets', 'img', 'images', 'video', 'status', 'ns1', 'ns2',
  'mx', 'relay', 'proxy', 'gateway', 'secure', 'login', 'auth',
  'sso', 'dashboard', 'panel', 'cpanel', 'control',
];

export const subdomainCheck: CheckModule = {
  id: 'subdomains',
  name: 'Subdomain Enumeration',
  description: 'Discovers subdomains using DNS brute-force and certificate transparency logs',
  category: 'dns',
  icon: 'network',
  run: async (target) => {
    const start = Date.now();
    try {
      if (target.isIP) {
        return { success: false, error: 'Subdomain enumeration requires a domain name', duration: Date.now() - start };
      }

      // Method 1: DNS brute-force common subdomains
      const dnsResults = await Promise.all(
        COMMON_SUBDOMAINS.map(async (sub) => {
          const fqdn = `${sub}.${target.hostname}`;
          try {
            const ips = await resolve4(fqdn);
            return { subdomain: fqdn, ips, source: 'dns' as const };
          } catch {
            return null;
          }
        }),
      );

      const dnsFound = dnsResults.filter(Boolean) as Array<{ subdomain: string; ips: string[]; source: 'dns' }>;

      // Method 2: Certificate Transparency via crt.sh
      let ctFound: Array<{ subdomain: string; source: 'ct' }> = [];
      try {
        const ctResponse = await safeFetch(
          `https://crt.sh/?q=${target.hostname}&output=json`,
          { timeoutMs: 8000 },
        );
        if (ctResponse.ok) {
          const ctData = await ctResponse.json() as Array<{ name_value: string }>;
          const uniqueSubs = new Set<string>();
          for (const entry of ctData.slice(0, 200)) {
            const names = entry.name_value.split('\n');
            for (const name of names) {
              const cleaned = name.trim().replace(/^\*\./, '').toLowerCase();
              if (
                cleaned.endsWith(`.${target.hostname}`) &&
                cleaned !== target.hostname &&
                !uniqueSubs.has(cleaned)
              ) {
                uniqueSubs.add(cleaned);
                ctFound.push({ subdomain: cleaned, source: 'ct' });
              }
            }
          }
        }
      } catch {
        // crt.sh may be slow/down
      }

      // Merge and deduplicate
      const allSubdomains = new Map<string, { subdomain: string; ips?: string[]; sources: string[] }>();
      for (const entry of dnsFound) {
        allSubdomains.set(entry.subdomain, { subdomain: entry.subdomain, ips: entry.ips, sources: ['dns'] });
      }
      for (const entry of ctFound) {
        const existing = allSubdomains.get(entry.subdomain);
        if (existing) {
          existing.sources.push('ct');
        } else {
          allSubdomains.set(entry.subdomain, { subdomain: entry.subdomain, sources: ['ct'] });
        }
      }

      const subdomains = Array.from(allSubdomains.values()).sort((a, b) => a.subdomain.localeCompare(b.subdomain));

      return {
        success: true,
        data: {
          subdomains: subdomains.slice(0, 100),
          totalFound: subdomains.length,
          isTruncated: subdomains.length > 100,
          methods: { dns: dnsFound.length, ct: ctFound.length },
        },
        duration: Date.now() - start,
      };
    } catch (error) {
      return { success: false, error: getErrorMessage(error), duration: Date.now() - start };
    }
  },
};
