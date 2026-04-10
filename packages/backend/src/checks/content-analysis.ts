import type { CheckModule } from './index.js';
import { safeFetch, getErrorMessage } from '../utils/safeFetch.js';

interface MetaTag {
  name: string;
  content: string;
}

function extractMetaTags(html: string): MetaTag[] {
  const tags: MetaTag[] = [];
  const metaRegex = /<meta\s+([^>]*)>/gi;
  let match: RegExpExecArray | null;

  while ((match = metaRegex.exec(html)) !== null) {
    const attrs = match[1] ?? '';
    const nameMatch = attrs.match(/(?:name|property)\s*=\s*["']([^"']+)["']/i);
    const contentMatch = attrs.match(/content\s*=\s*["']([^"']*?)["']/i);

    if (nameMatch?.[1]) {
      tags.push({
        name: nameMatch[1],
        content: contentMatch?.[1] ?? '',
      });
    }
  }
  return tags;
}

export const contentAnalysisCheck: CheckModule = {
  id: 'content-analysis',
  name: 'Content Analysis',
  description: 'Analyzes page metadata, OpenGraph tags, Twitter cards, and SEO elements',
  category: 'content',
  icon: 'file-search',
  run: async (target) => {
    const start = Date.now();
    try {
      const response = await safeFetch(target.url);
      const html = await response.text();

      // Extract title
      const title = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ?? null;

      // Extract meta tags
      const metaTags = extractMetaTags(html);
      const description = metaTags.find((t) => t.name.toLowerCase() === 'description')?.content ?? null;
      const keywords = metaTags.find((t) => t.name.toLowerCase() === 'keywords')?.content ?? null;
      const viewport = metaTags.find((t) => t.name.toLowerCase() === 'viewport')?.content ?? null;
      const robots = metaTags.find((t) => t.name.toLowerCase() === 'robots')?.content ?? null;
      const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1] ?? null;
      const lang = html.match(/<html[^>]+lang=["']([^"']+)["']/i)?.[1] ?? null;

      // OpenGraph
      const og: Record<string, string> = {};
      metaTags
        .filter((t) => t.name.startsWith('og:'))
        .forEach((t) => { og[t.name.replace('og:', '')] = t.content; });

      // Twitter Card
      const twitter: Record<string, string> = {};
      metaTags
        .filter((t) => t.name.startsWith('twitter:'))
        .forEach((t) => { twitter[t.name.replace('twitter:', '')] = t.content; });

      // Favicon
      const favicon = html.match(/<link[^>]+rel=["'](?:icon|shortcut icon)["'][^>]+href=["']([^"']+)["']/i)?.[1] ?? null;

      // Heading structure
      const h1Count = (html.match(/<h1[\s>]/gi) ?? []).length;
      const h2Count = (html.match(/<h2[\s>]/gi) ?? []).length;
      const h3Count = (html.match(/<h3[\s>]/gi) ?? []).length;

      // Word count (rough estimate)
      const textContent = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      const wordCount = textContent.split(' ').filter(Boolean).length;

      // Images without alt
      const imgCount = (html.match(/<img[\s>]/gi) ?? []).length;
      const imgWithAlt = (html.match(/<img[^>]+alt=["'][^"']+["']/gi) ?? []).length;
      const imgWithoutAlt = imgCount - imgWithAlt;

      // SEO Score
      let seoScore = 0;
      if (title) seoScore += 15;
      if (description) seoScore += 15;
      if (viewport) seoScore += 10;
      if (canonical) seoScore += 10;
      if (h1Count === 1) seoScore += 15;
      if (Object.keys(og).length > 0) seoScore += 10;
      if (Object.keys(twitter).length > 0) seoScore += 5;
      if (lang) seoScore += 5;
      if (favicon) seoScore += 5;
      if (imgWithoutAlt === 0 && imgCount > 0) seoScore += 10;

      return {
        success: true,
        data: {
          title,
          description,
          keywords,
          viewport,
          robots,
          canonical,
          language: lang,
          favicon,
          openGraph: Object.keys(og).length > 0 ? og : null,
          twitterCard: Object.keys(twitter).length > 0 ? twitter : null,
          headings: { h1: h1Count, h2: h2Count, h3: h3Count },
          wordCount,
          images: { total: imgCount, withAlt: imgWithAlt, withoutAlt: imgWithoutAlt },
          seoScore,
          seoGrade: seoScore >= 80 ? 'A' : seoScore >= 60 ? 'B' : seoScore >= 40 ? 'C' : seoScore >= 20 ? 'D' : 'F',
        },
        duration: Date.now() - start,
      };
    } catch (error) {
      return { success: false, error: getErrorMessage(error), duration: Date.now() - start };
    }
  },
};
