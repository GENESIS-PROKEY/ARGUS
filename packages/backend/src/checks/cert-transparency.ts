import type { CheckModule } from './index.js';
import { safeFetch, getErrorMessage } from '../utils/safeFetch.js';

interface CertEntry {
  issuer: string;
  commonName: string;
  notBefore: string;
  notAfter: string;
  status: 'valid' | 'expiring-soon' | 'expired';
}

export const certTransparencyCheck: CheckModule = {
  id: 'cert-transparency',
  name: 'Certificate Transparency',
  description: 'Checks certificate transparency logs for all certificates issued for the domain',
  category: 'security',
  icon: 'shield-check',
  run: async (target) => {
    const start = Date.now();
    try {
      const response = await safeFetch(
        `https://crt.sh/?q=%25.${target.hostname}&output=json`,
        { timeoutMs: 12000 },
      );

      if (!response.ok) {
        return { success: false, error: `crt.sh returned ${response.status}`, duration: Date.now() - start };
      }

      const raw = await response.json() as Array<Record<string, unknown>>;
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const seen = new Set<string>();
      const certs: CertEntry[] = [];
      const subdomainSet = new Set<string>();

      for (const entry of raw.slice(0, 200)) {
        const cn = (entry['common_name'] as string) ?? '';
        const issuer = (entry['issuer_name'] as string) ?? '';
        const notBefore = (entry['not_before'] as string) ?? '';
        const notAfter = (entry['not_after'] as string) ?? '';
        const nameValue = (entry['name_value'] as string) ?? '';

        const key = `${cn}|${notBefore}|${notAfter}`;
        if (seen.has(key)) continue;
        seen.add(key);

        const expiry = new Date(notAfter);
        let status: CertEntry['status'] = 'valid';
        if (expiry < now) status = 'expired';
        else if (expiry < thirtyDaysFromNow) status = 'expiring-soon';

        certs.push({ issuer: issuer.split(',')[0]?.replace('C=', '').trim() ?? issuer, commonName: cn, notBefore, notAfter, status });

        // Extract subdomains from SANs
        for (const name of nameValue.split('\n')) {
          const trimmed = name.trim().toLowerCase();
          if (trimmed && trimmed !== target.hostname && trimmed.endsWith(target.hostname)) {
            subdomainSet.add(trimmed);
          }
        }
      }

      certs.sort((a, b) => new Date(b.notAfter).getTime() - new Date(a.notAfter).getTime());
      const subdomainsFound = Array.from(subdomainSet).slice(0, 50);
      const expiringSoon = certs.filter(c => c.status === 'expiring-soon').length;

      let grade: string;
      if (certs.length > 0 && expiringSoon === 0) grade = 'A';
      else if (expiringSoon > 0) grade = 'C';
      else grade = 'B';

      return {
        success: true,
        data: {
          total: certs.length,
          certs: certs.slice(0, 25),
          subdomainsFound,
          expiringSoon,
          firstSeen: certs.length > 0 ? certs[certs.length - 1]!.notBefore : null,
          lastSeen: certs.length > 0 ? certs[0]!.notAfter : null,
          grade,
        },
        duration: Date.now() - start,
      };
    } catch (error) {
      return { success: false, error: getErrorMessage(error), duration: Date.now() - start };
    }
  },
};
