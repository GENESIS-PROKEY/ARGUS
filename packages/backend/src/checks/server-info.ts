import dns from 'node:dns';
import { promisify } from 'node:util';
import type { CheckModule } from './index.js';
import { safeFetch, getErrorMessage } from '../utils/safeFetch.js';

const dnsLookup = promisify(dns.lookup);

export const serverInfoCheck: CheckModule = {
  id: 'server-info',
  name: 'Server Info',
  description: 'Identifies hosting provider, ASN, server software, and network information',
  category: 'network',
  icon: 'server',
  run: async (target) => {
    const start = Date.now();
    try {
      let ip: string;
      if (target.isIP) {
        ip = target.hostname;
      } else {
        const resolved = await dnsLookup(target.hostname);
        ip = resolved.address;
      }

      // Get ASN/hosting info
      const [ipApiRes, headRes] = await Promise.allSettled([
        safeFetch(`http://ip-api.com/json/${ip}?fields=isp,org,as,asname,hosting,reverse`),
        safeFetch(target.url, { method: 'HEAD', timeoutMs: 5000 }),
      ]);

      let networkInfo: Record<string, unknown> = {};
      if (ipApiRes.status === 'fulfilled') {
        networkInfo = (await ipApiRes.value.json()) as Record<string, unknown>;
      }

      let serverHeaders: Record<string, string | null> = {};
      if (headRes.status === 'fulfilled') {
        serverHeaders = {
          server: headRes.value.headers.get('server'),
          poweredBy: headRes.value.headers.get('x-powered-by'),
          via: headRes.value.headers.get('via'),
          cdn: headRes.value.headers.get('x-cdn') ?? headRes.value.headers.get('x-cache'),
        };
      }

      return {
        success: true,
        data: {
          ip,
          isp: networkInfo['isp'] ?? null,
          org: networkInfo['org'] ?? null,
          asn: networkInfo['as'] ?? null,
          asnName: networkInfo['asname'] ?? null,
          isHosting: networkInfo['hosting'] ?? null,
          reverseDns: networkInfo['reverse'] ?? null,
          server: serverHeaders.server ?? null,
          poweredBy: serverHeaders.poweredBy ?? null,
          via: serverHeaders.via ?? null,
          cdn: serverHeaders.cdn ?? null,
        },
        duration: Date.now() - start,
      };
    } catch (error) {
      return { success: false, error: getErrorMessage(error), duration: Date.now() - start };
    }
  },
};
