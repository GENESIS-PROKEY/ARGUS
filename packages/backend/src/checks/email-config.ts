import dns from 'node:dns';
import { promisify } from 'node:util';
import type { CheckModule } from './index.js';
import { getErrorMessage } from '../utils/safeFetch.js';

const resolveTxt = promisify(dns.resolveTxt);

async function safeResolve<T>(fn: () => Promise<T>): Promise<T | null> {
  try { return await fn(); } catch { return null; }
}

function parseSPF(records: string[][] | null): { found: boolean; record?: string; analysis?: Record<string, unknown> } {
  if (!records) return { found: false };
  const spfRecord = records.map((r) => r.join('')).find((r) => r.startsWith('v=spf1'));
  if (!spfRecord) return { found: false };

  const mechanisms = spfRecord.split(/\s+/).slice(1);
  const includes = mechanisms.filter((m) => m.startsWith('include:'));
  const allMechanism = mechanisms.find((m) => m.match(/^[~+?-]?all$/));

  return {
    found: true,
    record: spfRecord,
    analysis: {
      includes: includes.map((i) => i.replace('include:', '')),
      allPolicy: allMechanism ?? 'not specified',
      isStrict: allMechanism === '-all',
      mechanismCount: mechanisms.length,
    },
  };
}

function parseDMARC(records: string[][] | null): { found: boolean; record?: string; analysis?: Record<string, unknown> } {
  if (!records) return { found: false };
  const dmarcRecord = records.map((r) => r.join('')).find((r) => r.startsWith('v=DMARC1'));
  if (!dmarcRecord) return { found: false };

  const tags: Record<string, string> = {};
  dmarcRecord.split(';').forEach((tag) => {
    const [key, ...vals] = tag.trim().split('=');
    if (key && vals.length > 0) tags[key.trim()] = vals.join('=').trim();
  });

  return {
    found: true,
    record: dmarcRecord,
    analysis: {
      policy: tags['p'] ?? 'none',
      subdomainPolicy: tags['sp'] ?? tags['p'] ?? 'none',
      percentage: tags['pct'] ?? '100',
      reportUri: tags['rua'] ?? null,
      forensicUri: tags['ruf'] ?? null,
      isStrict: tags['p'] === 'reject',
    },
  };
}

export const emailConfigCheck: CheckModule = {
  id: 'email-config',
  name: 'Email Security',
  description: 'Checks SPF, DKIM, and DMARC email authentication configurations',
  category: 'security',
  icon: 'mail',
  run: async (target) => {
    const start = Date.now();
    try {
      if (target.isIP) {
        return { success: false, error: 'Email checks require a domain name', duration: Date.now() - start };
      }

      const [spfRecords, dmarcRecords, dkimRecords] = await Promise.all([
        safeResolve(() => resolveTxt(target.hostname)),
        safeResolve(() => resolveTxt(`_dmarc.${target.hostname}`)),
        safeResolve(() => resolveTxt(`default._domainkey.${target.hostname}`)),
      ]);

      const spf = parseSPF(spfRecords);
      const dmarc = parseDMARC(dmarcRecords);
      const dkim = {
        found: dkimRecords !== null && dkimRecords.length > 0,
        record: dkimRecords ? dkimRecords.map((r) => r.join('')).find((r) => r.includes('v=DKIM1')) : null,
      };

      // Score email security
      let score = 0;
      if (spf.found) score += 30;
      if (dmarc.found) score += 40;
      if (dkim.found) score += 30;

      let grade: string;
      if (score >= 90) grade = 'A';
      else if (score >= 70) grade = 'B';
      else if (score >= 40) grade = 'C';
      else if (score >= 20) grade = 'D';
      else grade = 'F';

      return {
        success: true,
        data: {
          spf,
          dmarc,
          dkim,
          score,
          grade,
          recommendations: [
            ...(!spf.found ? ['Add an SPF record to prevent email spoofing'] : []),
            ...(!dmarc.found ? ['Add a DMARC policy to control email authentication'] : []),
            ...(!dkim.found ? ['Configure DKIM to cryptographically sign outgoing emails'] : []),
            ...(spf.found && spf.analysis && !spf.analysis['isStrict'] ? ['Consider using "-all" (hard fail) in your SPF record'] : []),
            ...(dmarc.found && dmarc.analysis && !dmarc.analysis['isStrict'] ? ['Consider setting DMARC policy to "reject"'] : []),
          ],
        },
        duration: Date.now() - start,
      };
    } catch (error) {
      return { success: false, error: getErrorMessage(error), duration: Date.now() - start };
    }
  },
};
