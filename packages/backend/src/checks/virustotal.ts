import type { CheckModule } from './index.js';
import { safeFetch, getErrorMessage } from '../utils/safeFetch.js';
import { config } from '../config/index.js';

export const virusTotalCheck: CheckModule = {
  id: 'virustotal',
  name: 'VirusTotal Threat Intel',
  description: 'Checks the URL against VirusTotal\'s multi-engine malware and phishing database',
  category: 'threats',
  icon: 'bug',
  run: async (target) => {
    const start = Date.now();
    try {
      if (!config.VIRUSTOTAL_API_KEY) {
        return {
          success: true,
          data: { available: false, reason: 'VirusTotal API key not configured' },
          duration: Date.now() - start,
        };
      }

      // Submit URL for analysis
      const submitRes = await safeFetch('https://www.virustotal.com/api/v3/urls', {
        method: 'POST',
        headers: {
          'x-apikey': config.VIRUSTOTAL_API_KEY,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `url=${encodeURIComponent(target.url)}`,
        timeoutMs: 10000,
      });

      if (!submitRes.ok) {
        const errText = await submitRes.text();
        return {
          success: false,
          error: `VirusTotal API error: ${submitRes.status} — ${errText.slice(0, 200)}`,
          duration: Date.now() - start,
        };
      }

      // Get domain report (more detailed)
      const domainRes = await safeFetch(
        `https://www.virustotal.com/api/v3/domains/${target.hostname}`,
        {
          headers: { 'x-apikey': config.VIRUSTOTAL_API_KEY },
          timeoutMs: 10000,
        },
      );

      if (!domainRes.ok) {
        // Fall back to URL ID lookup
        const urlId = btoa(target.url).replace(/=/g, '');
        const urlRes = await safeFetch(
          `https://www.virustotal.com/api/v3/urls/${urlId}`,
          {
            headers: { 'x-apikey': config.VIRUSTOTAL_API_KEY },
            timeoutMs: 10000,
          },
        );
        if (urlRes.ok) {
          const urlData = await urlRes.json() as Record<string, unknown>;
          const attrs = (urlData['data'] as Record<string, unknown>)?.['attributes'] as Record<string, unknown> ?? {};
          const stats = attrs['last_analysis_stats'] as Record<string, number> ?? {};
          return {
            success: true,
            data: {
              available: true,
              source: 'url',
              malicious: stats['malicious'] ?? 0,
              suspicious: stats['suspicious'] ?? 0,
              harmless: stats['harmless'] ?? 0,
              undetected: stats['undetected'] ?? 0,
              totalEngines: Object.values(stats).reduce((a, b) => a + b, 0),
              reputation: attrs['reputation'] ?? null,
              isSafe: (stats['malicious'] ?? 0) === 0 && (stats['suspicious'] ?? 0) === 0,
            },
            duration: Date.now() - start,
          };
        }
        return { success: false, error: 'Could not retrieve VirusTotal report', duration: Date.now() - start };
      }

      const domainData = await domainRes.json() as Record<string, unknown>;
      const attrs = (domainData['data'] as Record<string, unknown>)?.['attributes'] as Record<string, unknown> ?? {};
      const stats = attrs['last_analysis_stats'] as Record<string, number> ?? {};
      const categories = attrs['categories'] as Record<string, string> ?? {};

      return {
        success: true,
        data: {
          available: true,
          source: 'domain',
          malicious: stats['malicious'] ?? 0,
          suspicious: stats['suspicious'] ?? 0,
          harmless: stats['harmless'] ?? 0,
          undetected: stats['undetected'] ?? 0,
          totalEngines: Object.values(stats).reduce((a, b) => a + b, 0),
          reputation: attrs['reputation'] ?? null,
          categories,
          registrar: attrs['registrar'] ?? null,
          lastAnalysisDate: attrs['last_analysis_date'] ?? null,
          isSafe: (stats['malicious'] ?? 0) === 0 && (stats['suspicious'] ?? 0) === 0,
          vtUrl: `https://www.virustotal.com/gui/domain/${target.hostname}`,
        },
        duration: Date.now() - start,
      };
    } catch (error) {
      return { success: false, error: getErrorMessage(error), duration: Date.now() - start };
    }
  },
};
