import type { CheckModule } from './index.js';
import { safeFetch, getErrorMessage } from '../utils/safeFetch.js';

interface RobotsRule {
  userAgent: string;
  allow: string[];
  disallow: string[];
}

function parseRobotsTxt(content: string): { rules: RobotsRule[]; sitemaps: string[] } {
  const lines = content.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
  const rules: RobotsRule[] = [];
  const sitemaps: string[] = [];

  let current: RobotsRule | null = null;

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;
    const directive = line.slice(0, colonIndex).trim().toLowerCase();
    const value = line.slice(colonIndex + 1).trim();

    if (directive === 'user-agent') {
      current = { userAgent: value, allow: [], disallow: [] };
      rules.push(current);
    } else if (directive === 'disallow' && current) {
      if (value) current.disallow.push(value);
    } else if (directive === 'allow' && current) {
      if (value) current.allow.push(value);
    } else if (directive === 'sitemap') {
      sitemaps.push(value);
    }
  }

  return { rules, sitemaps };
}

export const robotsTxtCheck: CheckModule = {
  id: 'robots-txt',
  name: 'Robots.txt',
  description: 'Fetches and parses robots.txt crawl rules and sitemap references',
  category: 'content',
  icon: 'bot',
  run: async (target) => {
    const start = Date.now();
    try {
      const response = await safeFetch(`${target.url}/robots.txt`);

      if (response.status === 404) {
        return {
          success: true,
          data: { exists: false, message: 'No robots.txt file found' },
          duration: Date.now() - start,
        };
      }

      const text = await response.text();
      const contentType = response.headers.get('content-type') ?? '';
      if (contentType.includes('text/html')) {
        return {
          success: true,
          data: { exists: false, message: 'Server returned HTML instead of robots.txt' },
          duration: Date.now() - start,
        };
      }

      const parsed = parseRobotsTxt(text);

      return {
        success: true,
        data: {
          exists: true,
          raw: text.slice(0, 5000),
          rules: parsed.rules,
          sitemaps: parsed.sitemaps,
          totalRules: parsed.rules.length,
          totalDisallowed: parsed.rules.reduce((sum, r) => sum + r.disallow.length, 0),
        },
        duration: Date.now() - start,
      };
    } catch (error) {
      return { success: false, error: getErrorMessage(error), duration: Date.now() - start };
    }
  },
};
