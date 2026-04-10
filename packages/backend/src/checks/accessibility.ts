import type { CheckModule } from './index.js';
import { safeFetch, getErrorMessage } from '../utils/safeFetch.js';

const CRITERIA = [
  { id: 'images-alt', name: 'Images have alt attributes', check: (html: string) => {
    const imgs = html.match(/<img\b[^>]*>/gi) ?? [];
    if (imgs.length === 0) return true;
    const withAlt = imgs.filter(img => /alt\s*=\s*["'][^"']*["']/i.test(img));
    return withAlt.length / imgs.length >= 0.8;
  }},
  { id: 'single-h1', name: 'Single H1 heading exists', check: (html: string) => {
    const h1s = html.match(/<h1[\s>]/gi) ?? [];
    return h1s.length === 1;
  }},
  { id: 'input-labels', name: 'Form inputs have labels', check: (html: string) => {
    const inputs = html.match(/<input\b[^>]*>/gi) ?? [];
    const formInputs = inputs.filter(i => !/type\s*=\s*["'](hidden|submit|button)["']/i.test(i));
    if (formInputs.length === 0) return true;
    const labels = html.match(/<label[\s>]/gi) ?? [];
    return labels.length >= formInputs.length * 0.7;
  }},
  { id: 'html-lang', name: 'HTML lang attribute present', check: (html: string) => {
    return /<html[^>]+lang\s*=\s*["'][^"']+["']/i.test(html);
  }},
  { id: 'viewport-meta', name: 'Viewport meta tag present', check: (html: string) => {
    return /<meta[^>]+name\s*=\s*["']viewport["']/i.test(html);
  }},
  { id: 'descriptive-links', name: 'Links have descriptive text', check: (html: string) => {
    const links = html.match(/<a\b[^>]*>([^<]*)<\/a>/gi) ?? [];
    if (links.length === 0) return true;
    const vague = links.filter(l => />(click here|read more|here|link)<\/a>/i.test(l));
    return vague.length / links.length < 0.2;
  }},
  { id: 'button-labels', name: 'Buttons have accessible text', check: (html: string) => {
    const buttons = html.match(/<button\b[^>]*>[\s\S]*?<\/button>/gi) ?? [];
    if (buttons.length === 0) return true;
    const empty = buttons.filter(b => {
      const innerText = b.replace(/<[^>]+>/g, '').trim();
      const hasAriaLabel = /aria-label\s*=\s*["'][^"']+["']/i.test(b);
      return !innerText && !hasAriaLabel;
    });
    return empty.length / buttons.length < 0.2;
  }},
];

export const accessibilityCheck: CheckModule = {
  id: 'accessibility',
  name: 'Accessibility',
  description: 'Checks basic WCAG accessibility criteria on the page',
  category: 'performance',
  icon: 'accessibility',
  run: async (target) => {
    const start = Date.now();
    try {
      const response = await safeFetch(target.url, {
        timeoutMs: 10000,
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ARGUS/1.0)' },
      });

      if (!response.ok) {
        return { success: false, error: `Failed to fetch page: ${response.status}`, duration: Date.now() - start };
      }

      const html = await response.text();
      const passed: string[] = [];
      const failed: string[] = [];

      for (const criterion of CRITERIA) {
        if (criterion.check(html)) {
          passed.push(criterion.name);
        } else {
          failed.push(criterion.name);
        }
      }

      const score = Math.round((passed.length / CRITERIA.length) * 100);

      let grade: string;
      if (score >= 90) grade = 'A';
      else if (score >= 75) grade = 'B';
      else if (score >= 60) grade = 'C';
      else if (score >= 45) grade = 'D';
      else grade = 'F';

      let wcagLevel = 'None';
      if (score >= 90) wcagLevel = 'AA';
      else if (score >= 70) wcagLevel = 'A';

      return {
        success: true,
        data: {
          score,
          passed,
          failed,
          total: CRITERIA.length,
          grade,
          wcagLevel,
        },
        duration: Date.now() - start,
      };
    } catch (error) {
      return { success: false, error: getErrorMessage(error), duration: Date.now() - start };
    }
  },
};
