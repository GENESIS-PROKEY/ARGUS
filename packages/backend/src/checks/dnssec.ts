import dns from 'node:dns';
import { promisify } from 'node:util';
import type { CheckModule } from './index.js';
import { safeFetch, getErrorMessage } from '../utils/safeFetch.js';

const resolveTxt = promisify(dns.resolveTxt);

async function safeResolve<T>(fn: () => Promise<T>): Promise<T | null> {
  try { return await fn(); } catch { return null; }
}

export const dnssecCheck: CheckModule = {
  id: 'dnssec',
  name: 'DNS Security',
  description: 'Checks DNSSEC validation status and DNS-based security extensions',
  category: 'dns',
  icon: 'shield-check',
  run: async (target) => {
    const start = Date.now();
    try {
      if (target.isIP) {
        return { success: false, error: 'DNSSEC checks require a domain name', duration: Date.now() - start };
      }

      // Check DNSSEC via Google's DoH API
      let dnssecEnabled = false;
      let dnssecData: unknown = null;

      try {
        const dohResponse = await safeFetch(
          `https://dns.google/resolve?name=${target.hostname}&type=A&do=true`,
          { timeoutMs: 5000 },
        );
        const dohResult = await dohResponse.json() as Record<string, unknown>;
        dnssecEnabled = Boolean(dohResult['AD']); // Authenticated Data flag
        dnssecData = {
          authenticatedData: Boolean(dohResult['AD']),
          checkingDisabled: Boolean(dohResult['CD']),
          status: dohResult['Status'],
          answers: dohResult['Answer'],
        };
      } catch {
        // DoH unavailable
      }

      // Check for CAA records
      const caaRecords = await safeResolve(() =>
        new Promise<dns.RecordWithTtl[]>((resolve, reject) => {
          dns.resolveCaa(target.hostname, (err, records) => {
            if (err) reject(err);
            else resolve(records as unknown as dns.RecordWithTtl[]);
          });
        }),
      );

      // Check for DNSKEY via DoH
      let hasDnskey = false;
      try {
        const dnskeyRes = await safeFetch(
          `https://dns.google/resolve?name=${target.hostname}&type=DNSKEY`,
          { timeoutMs: 5000 },
        );
        const dnskeyData = await dnskeyRes.json() as Record<string, unknown>;
        hasDnskey = Array.isArray(dnskeyData['Answer']) && (dnskeyData['Answer'] as unknown[]).length > 0;
      } catch {
        // ignore
      }

      // Check for TLSA records via DoH
      let hasTlsa = false;
      try {
        const tlsaRes = await safeFetch(
          `https://dns.google/resolve?name=_443._tcp.${target.hostname}&type=TLSA`,
          { timeoutMs: 5000 },
        );
        const tlsaData = await tlsaRes.json() as Record<string, unknown>;
        hasTlsa = Array.isArray(tlsaData['Answer']) && (tlsaData['Answer'] as unknown[]).length > 0;
      } catch {
        // ignore
      }

      return {
        success: true,
        data: {
          dnssecEnabled,
          dnssecData,
          hasDnskey,
          hasTlsa,
          caaRecords,
          grade: dnssecEnabled ? 'A' : (hasDnskey ? 'B' : 'F'),
        },
        duration: Date.now() - start,
      };
    } catch (error) {
      return { success: false, error: getErrorMessage(error), duration: Date.now() - start };
    }
  },
};
