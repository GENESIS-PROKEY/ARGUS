import type { CheckModule } from './index.js';
import { safeFetch, getErrorMessage } from '../utils/safeFetch.js';

interface DetectedTech {
  name: string;
  category: string;
  confidence: number;
  version?: string;
}

// Fingerprint signatures for common technologies
const TECH_SIGNATURES: Array<{
  name: string;
  category: string;
  headers?: Record<string, RegExp>;
  htmlPatterns?: RegExp[];
  metaPatterns?: Array<{ name: RegExp; content?: RegExp }>;
}> = [
  { name: 'Nginx', category: 'Web Server', headers: { server: /nginx/i } },
  { name: 'Apache', category: 'Web Server', headers: { server: /apache/i } },
  { name: 'Cloudflare', category: 'CDN', headers: { server: /cloudflare/i } },
  { name: 'LiteSpeed', category: 'Web Server', headers: { server: /litespeed/i } },
  { name: 'IIS', category: 'Web Server', headers: { server: /microsoft-iis/i } },
  { name: 'Express.js', category: 'Framework', headers: { 'x-powered-by': /express/i } },
  { name: 'Next.js', category: 'Framework', headers: { 'x-powered-by': /next\.?js/i } },
  { name: 'PHP', category: 'Language', headers: { 'x-powered-by': /php/i } },
  { name: 'ASP.NET', category: 'Framework', headers: { 'x-powered-by': /asp\.net/i } },
  { name: 'Vercel', category: 'Hosting', headers: { server: /vercel/i, 'x-vercel-id': /.*/ } },
  { name: 'Netlify', category: 'Hosting', headers: { server: /netlify/i } },
  { name: 'AWS', category: 'Hosting', headers: { server: /amazons3|awselb|cloudfront/i } },
  { name: 'Google Cloud', category: 'Hosting', headers: { server: /gws|gse/i } },
  { name: 'Varnish', category: 'Cache', headers: { via: /varnish/i, 'x-varnish': /.*/ } },
  { name: 'React', category: 'JS Framework', htmlPatterns: [/__NEXT_DATA__|_next\/static|react-root|data-reactroot|__react/i] },
  { name: 'Vue.js', category: 'JS Framework', htmlPatterns: [/data-v-[a-f0-9]|__vue|vue-app|nuxt/i] },
  { name: 'Angular', category: 'JS Framework', htmlPatterns: [/ng-version|ng-app|_ngcontent|angular\.min\.js/i] },
  { name: 'Svelte', category: 'JS Framework', htmlPatterns: [/svelte-[a-z]|__svelte/i] },
  { name: 'jQuery', category: 'JS Library', htmlPatterns: [/jquery[.-]?\d|jquery\.min\.js/i] },
  { name: 'WordPress', category: 'CMS', htmlPatterns: [/wp-content|wp-includes|wordpress/i] },
  { name: 'Shopify', category: 'E-commerce', htmlPatterns: [/cdn\.shopify\.com|shopify\.com\/s/i] },
  { name: 'Wix', category: 'CMS', htmlPatterns: [/static\.wixstatic\.com|wix\.com/i] },
  { name: 'Squarespace', category: 'CMS', htmlPatterns: [/squarespace\.com|sqsp\.net/i] },
  { name: 'Drupal', category: 'CMS', htmlPatterns: [/drupal\.js|drupal\.settings|\/sites\/default/i] },
  { name: 'Google Analytics', category: 'Analytics', htmlPatterns: [/google-analytics\.com|gtag|googletagmanager/i] },
  { name: 'Google Tag Manager', category: 'Tag Manager', htmlPatterns: [/googletagmanager\.com\/gtm/i] },
  { name: 'Bootstrap', category: 'CSS Framework', htmlPatterns: [/bootstrap\.min\.(css|js)|getbootstrap/i] },
  { name: 'Tailwind CSS', category: 'CSS Framework', htmlPatterns: [/tailwindcss|tailwind\.min\.css/i] },
  { name: 'Font Awesome', category: 'Font', htmlPatterns: [/fontawesome|font-awesome/i] },
  { name: 'Cloudflare Turnstile', category: 'Security', htmlPatterns: [/challenges\.cloudflare\.com/i] },
  { name: 'reCAPTCHA', category: 'Security', htmlPatterns: [/recaptcha|google\.com\/recaptcha/i] },
  { name: 'hCaptcha', category: 'Security', htmlPatterns: [/hcaptcha\.com/i] },
];

export const techStackCheck: CheckModule = {
  id: 'tech-stack',
  name: 'Tech Stack',
  description: 'Detects web technologies, frameworks, CMS, and libraries used by the site',
  category: 'content',
  icon: 'layers',
  run: async (target) => {
    const start = Date.now();
    try {
      const response = await safeFetch(target.url);
      const html = await response.text();

      const detected: DetectedTech[] = [];

      for (const sig of TECH_SIGNATURES) {
        let matched = false;

        // Check headers
        if (sig.headers) {
          for (const [header, pattern] of Object.entries(sig.headers)) {
            const value = response.headers.get(header);
            if (value && pattern.test(value)) {
              matched = true;
              // Try to extract version
              const versionMatch = value.match(/[\d]+\.[\d]+(?:\.[\d]+)?/);
              if (versionMatch) {
                detected.push({ name: sig.name, category: sig.category, confidence: 100, version: versionMatch[0] });
              } else {
                detected.push({ name: sig.name, category: sig.category, confidence: 100 });
              }
              break;
            }
          }
        }

        // Check HTML patterns
        if (!matched && sig.htmlPatterns) {
          for (const pattern of sig.htmlPatterns) {
            if (pattern.test(html)) {
              detected.push({ name: sig.name, category: sig.category, confidence: 80 });
              matched = true;
              break;
            }
          }
        }
      }

      // Group by category
      const byCategory: Record<string, DetectedTech[]> = {};
      for (const tech of detected) {
        if (!byCategory[tech.category]) byCategory[tech.category] = [];
        byCategory[tech.category]!.push(tech);
      }

      return {
        success: true,
        data: {
          technologies: detected,
          byCategory,
          count: detected.length,
        },
        duration: Date.now() - start,
      };
    } catch (error) {
      return { success: false, error: getErrorMessage(error), duration: Date.now() - start };
    }
  },
};
