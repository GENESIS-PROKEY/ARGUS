import dns from 'node:dns';
import { promisify } from 'node:util';
import type { CheckModule } from './index.js';
import { getErrorMessage } from '../utils/safeFetch.js';

const resolve4 = promisify(dns.resolve4);
const resolve6 = promisify(dns.resolve6);
const resolveMx = promisify(dns.resolveMx);
const resolveTxt = promisify(dns.resolveTxt);
const resolveNs = promisify(dns.resolveNs);
const resolveCname = promisify(dns.resolveCname);
const resolveSoa = promisify(dns.resolveSoa);
const resolveCaa = promisify(dns.resolveCaa);

async function safeResolve<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch {
    return null;
  }
}

export const dnsRecordsCheck: CheckModule = {
  id: 'dns-records',
  name: 'DNS Records',
  description: 'Queries all DNS record types including A, AAAA, MX, NS, CNAME, TXT, CAA, and SOA',
  category: 'dns',
  icon: 'globe',
  run: async (target) => {
    const start = Date.now();
    try {
      if (target.isIP) {
        return {
          success: false,
          error: 'DNS records cannot be looked up for IP addresses — enter a domain name instead',
          duration: Date.now() - start,
        };
      }

      const [a, aaaa, mx, txt, ns, cname, soa, caa] = await Promise.all([
        safeResolve(() => resolve4(target.hostname)),
        safeResolve(() => resolve6(target.hostname)),
        safeResolve(() => resolveMx(target.hostname)),
        safeResolve(() => resolveTxt(target.hostname)),
        safeResolve(() => resolveNs(target.hostname)),
        safeResolve(() => resolveCname(target.hostname)),
        safeResolve(() => resolveSoa(target.hostname)),
        safeResolve(() => resolveCaa(target.hostname)),
      ]);

      const records = {
        A: a,
        AAAA: aaaa,
        MX: mx?.sort((x, y) => x.priority - y.priority) ?? null,
        TXT: txt?.map((r) => r.join('')) ?? null,
        NS: ns,
        CNAME: cname,
        SOA: soa,
        CAA: caa,
      };

      const hasAny = Object.values(records).some((v) => v !== null);
      if (!hasAny) {
        return {
          success: false,
          error: 'No DNS records found for this domain',
          duration: Date.now() - start,
        };
      }

      return { success: true, data: records, duration: Date.now() - start };
    } catch (error) {
      return { success: false, error: getErrorMessage(error), duration: Date.now() - start };
    }
  },
};
