import type { CheckModule } from './index.js';
import { safeFetch, getErrorMessage } from '../utils/safeFetch.js';

export const linkAnalysisCheck: CheckModule = {
  id: 'link-analysis',
  name: 'Link Analysis',
  description: 'Analyzes internal and external links on the page',
  category: 'content',
  icon: 'link',
  run: async (target) => {
    const start = Date.now();
    try {
      const response = await safeFetch(target.url);
      const html = await response.text();

      const linkRegex = /<a\s+[^>]*href\s*=\s*["']([^"'#]+)["'][^>]*>/gi;
      const links: Array<{ url: string; type: 'internal' | 'external' }> = [];
      const seen = new Set<string>();
      let match: RegExpExecArray | null;

      while ((match = linkRegex.exec(html)) !== null) {
        let href = match[1]?.trim() ?? '';
        if (!href || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;

        // Normalize
        if (href.startsWith('//')) href = `https:${href}`;
        else if (href.startsWith('/')) href = `${target.url}${href}`;

        if (seen.has(href)) continue;
        seen.add(href);

        try {
          const linkHostname = new URL(href).hostname;
          const isInternal = linkHostname === target.hostname || linkHostname.endsWith(`.${target.hostname}`);
          links.push({ url: href, type: isInternal ? 'internal' : 'external' });
        } catch {
          links.push({ url: href, type: 'internal' });
        }
      }

      const internalLinks = links.filter((l) => l.type === 'internal');
      const externalLinks = links.filter((l) => l.type === 'external');

      // Unique external domains
      const extDomains = new Set<string>();
      for (const link of externalLinks) {
        try { extDomains.add(new URL(link.url).hostname); } catch { /* skip */ }
      }

      return {
        success: true,
        data: {
          totalLinks: links.length,
          internalLinks: internalLinks.length,
          externalLinks: externalLinks.length,
          uniqueExternalDomains: Array.from(extDomains).slice(0, 50),
          externalDomainCount: extDomains.size,
          sampleInternal: internalLinks.slice(0, 20).map((l) => l.url),
          sampleExternal: externalLinks.slice(0, 20).map((l) => l.url),
        },
        duration: Date.now() - start,
      };
    } catch (error) {
      return { success: false, error: getErrorMessage(error), duration: Date.now() - start };
    }
  },
};
