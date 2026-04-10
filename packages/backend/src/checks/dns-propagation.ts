import type { CheckModule } from './index.js';
import { getErrorMessage } from '../utils/safeFetch.js';
import dns from 'node:dns';

interface ResolverResult {
  name: string;
  resolver: string;
  ip: string | null;
  latency: number;
  error?: string;
}

const RESOLVERS: Array<{ name: string; ip: string }> = [
  { name: 'Google', ip: '8.8.8.8' },
  { name: 'Google 2', ip: '8.8.4.4' },
  { name: 'Cloudflare', ip: '1.1.1.1' },
  { name: 'Cloudflare 2', ip: '1.0.0.1' },
  { name: 'Quad9', ip: '9.9.9.9' },
  { name: 'OpenDNS', ip: '208.67.222.222' },
  { name: 'AdGuard', ip: '94.140.14.14' },
  { name: 'CleanBrowsing', ip: '185.228.168.9' },
];

function resolveWithServer(hostname: string, server: string): Promise<{ ips: string[]; latency: number }> {
  return new Promise((resolve) => {
    const resolver = new dns.Resolver();
    resolver.setServers([server]);
    const start = Date.now();
    const timeout = setTimeout(() => {
      resolve({ ips: [], latency: Date.now() - start });
    }, 5000);
    resolver.resolve4(hostname, (err, addresses) => {
      clearTimeout(timeout);
      if (err) {
        resolve({ ips: [], latency: Date.now() - start });
      } else {
        resolve({ ips: addresses ?? [], latency: Date.now() - start });
      }
    });
  });
}

export const dnsPropagationCheck: CheckModule = {
  id: 'dns-propagation',
  name: 'DNS Propagation',
  description: 'Checks DNS resolution consistency across 8 global resolvers',
  category: 'dns',
  icon: 'radio',
  run: async (target) => {
    const start = Date.now();
    try {
      const results = await Promise.all(
        RESOLVERS.map(async (r): Promise<ResolverResult> => {
          const res = await resolveWithServer(target.hostname, r.ip);
          return {
            name: r.name,
            resolver: r.ip,
            ip: res.ips[0] ?? null,
            latency: res.latency,
            error: res.ips.length === 0 ? 'No result' : undefined,
          };
        }),
      );

      const uniqueIPs = Array.from(new Set(results.map(r => r.ip).filter(Boolean) as string[]));
      const consistent = uniqueIPs.length <= 1;

      let grade: string;
      if (consistent) grade = 'A';
      else if (uniqueIPs.length <= 3) grade = 'B';
      else grade = 'F';

      return {
        success: true,
        data: {
          results,
          consistent,
          uniqueIPs,
          resolverCount: RESOLVERS.length,
          grade,
        },
        duration: Date.now() - start,
      };
    } catch (error) {
      return { success: false, error: getErrorMessage(error), duration: Date.now() - start };
    }
  },
};
