import type { CheckModule } from './index.js';
import { safeFetch, getErrorMessage } from '../utils/safeFetch.js';

export const qualityScoreCheck: CheckModule = {
  id: 'quality-score',
  name: 'Quality Metrics',
  description: 'Evaluates overall website quality based on accessibility, best practices, and structure',
  category: 'performance',
  icon: 'award',
  run: async (target) => {
    const start = Date.now();
    try {
      const response = await safeFetch(target.url);
      const html = await response.text();
      const headers: Record<string, string> = {};
      response.headers.forEach((v, k) => { headers[k] = v; });

      const checks: Array<{ name: string; passed: boolean; impact: 'high' | 'medium' | 'low'; detail: string }> = [];

      // Accessibility checks
      checks.push({
        name: 'HTML lang attribute',
        passed: /<html[^>]+lang=/i.test(html),
        impact: 'high',
        detail: 'The <html> element should have a lang attribute',
      });
      checks.push({
        name: 'Viewport meta tag',
        passed: /name=["']viewport["']/i.test(html),
        impact: 'high',
        detail: 'Mobile viewport meta tag should be present',
      });
      checks.push({
        name: 'Document title',
        passed: /<title[^>]*>[^<]+<\/title>/i.test(html),
        impact: 'high',
        detail: 'Page should have a non-empty <title>',
      });
      checks.push({
        name: 'Meta description',
        passed: /name=["']description["']/i.test(html),
        impact: 'medium',
        detail: 'Page should have a meta description',
      });
      checks.push({
        name: 'DOCTYPE declaration',
        passed: /<!DOCTYPE/i.test(html),
        impact: 'medium',
        detail: 'Page should declare a DOCTYPE',
      });
      checks.push({
        name: 'Character encoding',
        passed: /charset=/i.test(html) || Boolean(headers['content-type']?.includes('charset')),
        impact: 'medium',
        detail: 'Character encoding should be declared',
      });
      checks.push({
        name: 'HTTPS',
        passed: target.protocol === 'https',
        impact: 'high',
        detail: 'Site should be served over HTTPS',
      });
      checks.push({
        name: 'No mixed content',
        passed: !(/src=["']http:\/\//i.test(html) && target.protocol === 'https'),
        impact: 'high',
        detail: 'HTTPS pages should not load HTTP resources',
      });
      checks.push({
        name: 'Canonical URL',
        passed: /rel=["']canonical["']/i.test(html),
        impact: 'low',
        detail: 'Page should define a canonical URL',
      });
      checks.push({
        name: 'Favicon',
        passed: /rel=["'](?:icon|shortcut icon)["']/i.test(html),
        impact: 'low',
        detail: 'Site should have a favicon',
      });
      checks.push({
        name: 'OpenGraph tags',
        passed: /property=["']og:/i.test(html),
        impact: 'low',
        detail: 'OpenGraph meta tags improve social sharing',
      });
      checks.push({
        name: 'Compression enabled',
        passed: Boolean(headers['content-encoding']),
        impact: 'medium',
        detail: 'Response should be compressed (gzip, br, etc.)',
      });

      const passed = checks.filter((c) => c.passed).length;
      const total = checks.length;
      const score = Math.round((passed / total) * 100);

      let grade: string;
      if (score >= 90) grade = 'A';
      else if (score >= 75) grade = 'B';
      else if (score >= 60) grade = 'C';
      else if (score >= 40) grade = 'D';
      else grade = 'F';

      return {
        success: true,
        data: {
          checks,
          passed,
          failed: total - passed,
          total,
          score,
          grade,
        },
        duration: Date.now() - start,
      };
    } catch (error) {
      return { success: false, error: getErrorMessage(error), duration: Date.now() - start };
    }
  },
};
