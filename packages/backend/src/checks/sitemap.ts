import type { CheckModule } from './index.js';
import { safeFetch, getErrorMessage } from '../utils/safeFetch.js';

interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

function parseSitemapXml(xml: string): SitemapEntry[] {
  const entries: SitemapEntry[] = [];
  const urlRegex = /<url>([\s\S]*?)<\/url>/gi;
  let match: RegExpExecArray | null;

  while ((match = urlRegex.exec(xml)) !== null) {
    const block = match[1] ?? '';
    const loc = block.match(/<loc>(.*?)<\/loc>/)?.[1] ?? '';
    if (!loc) continue;
    entries.push({
      loc,
      lastmod: block.match(/<lastmod>(.*?)<\/lastmod>/)?.[1],
      changefreq: block.match(/<changefreq>(.*?)<\/changefreq>/)?.[1],
      priority: block.match(/<priority>(.*?)<\/priority>/)?.[1],
    });
  }
  return entries;
}

export const sitemapCheck: CheckModule = {
  id: 'sitemap',
  name: 'Sitemap',
  description: 'Fetches and parses the XML sitemap to discover indexed pages',
  category: 'content',
  icon: 'map',
  run: async (target) => {
    const start = Date.now();
    try {
      const paths = ['/sitemap.xml', '/sitemap_index.xml', '/sitemap.txt'];
      let foundContent: string | null = null;
      let foundPath: string | null = null;

      for (const path of paths) {
        try {
          const response = await safeFetch(`${target.url}${path}`, { timeoutMs: 5000 });
          if (response.ok) {
            const text = await response.text();
            if (text.includes('<urlset') || text.includes('<sitemapindex') || text.includes('http')) {
              foundContent = text;
              foundPath = path;
              break;
            }
          }
        } catch {
          continue;
        }
      }

      if (!foundContent || !foundPath) {
        return {
          success: true,
          data: { exists: false, message: 'No sitemap found' },
          duration: Date.now() - start,
        };
      }

      const entries = parseSitemapXml(foundContent);

      return {
        success: true,
        data: {
          exists: true,
          path: foundPath,
          pageCount: entries.length,
          pages: entries.slice(0, 50), // Limit to first 50
          isTruncated: entries.length > 50,
        },
        duration: Date.now() - start,
      };
    } catch (error) {
      return { success: false, error: getErrorMessage(error), duration: Date.now() - start };
    }
  },
};
