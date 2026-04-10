import type { CheckModule } from './index.js';
import { safeFetch, getErrorMessage } from '../utils/safeFetch.js';

interface TrackerSignature {
  name: string;
  category: 'analytics' | 'advertising' | 'social' | 'support' | 'other';
  patterns: string[];
}

const TRACKER_SIGNATURES: TrackerSignature[] = [
  { name: 'Google Analytics', category: 'analytics', patterns: ['google-analytics.com', 'googletagmanager.com', 'gtag/js', 'ga.js', 'analytics.js'] },
  { name: 'Google Ads', category: 'advertising', patterns: ['googleadservices.com', 'googlesyndication.com', 'doubleclick.net'] },
  { name: 'Meta Pixel', category: 'advertising', patterns: ['connect.facebook.net', 'facebook.com/tr', 'fbevents.js'] },
  { name: 'LinkedIn Insight', category: 'analytics', patterns: ['snap.licdn.com', 'linkedin.com/px'] },
  { name: 'Twitter/X', category: 'social', patterns: ['static.ads-twitter.com', 'platform.twitter.com'] },
  { name: 'TikTok', category: 'analytics', patterns: ['analytics.tiktok.com', 'tiktok.com/i18n'] },
  { name: 'Hotjar', category: 'analytics', patterns: ['static.hotjar.com', 'hotjar.com'] },
  { name: 'Mixpanel', category: 'analytics', patterns: ['cdn.mxpnl.com', 'mixpanel.com'] },
  { name: 'Amplitude', category: 'analytics', patterns: ['cdn.amplitude.com', 'amplitude.com'] },
  { name: 'Segment', category: 'analytics', patterns: ['cdn.segment.com', 'segment.io'] },
  { name: 'Intercom', category: 'support', patterns: ['widget.intercom.io', 'intercom.io'] },
  { name: 'Drift', category: 'support', patterns: ['js.driftt.com', 'drift.com'] },
  { name: 'Crisp', category: 'support', patterns: ['client.crisp.chat', 'crisp.chat'] },
  { name: 'HubSpot', category: 'analytics', patterns: ['js.hs-scripts.com', 'hubspot.com', 'hs-analytics.net'] },
  { name: 'Cloudflare Insights', category: 'analytics', patterns: ['static.cloudflareinsights.com', 'beacon.min.js'] },
  { name: 'Sentry', category: 'other', patterns: ['browser.sentry-cdn.com', 'sentry.io'] },
  { name: 'New Relic', category: 'analytics', patterns: ['js-agent.newrelic.com', 'newrelic.com'] },
];

export const trackersCheck: CheckModule = {
  id: 'trackers',
  name: 'Third-Party Trackers',
  description: 'Detects third-party tracking scripts and analytics on the page',
  category: 'content',
  icon: 'eye',
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
      const htmlLower = html.toLowerCase();

      const found: Array<{ name: string; category: string; matchedPattern: string }> = [];
      const categories = new Set<string>();

      for (const sig of TRACKER_SIGNATURES) {
        for (const pattern of sig.patterns) {
          if (htmlLower.includes(pattern.toLowerCase())) {
            found.push({ name: sig.name, category: sig.category, matchedPattern: pattern });
            categories.add(sig.category);
            break; // Only count each tracker once
          }
        }
      }

      let grade: string;
      const count = found.length;
      if (count === 0) grade = 'A';
      else if (count <= 2) grade = 'B';
      else if (count <= 5) grade = 'C';
      else if (count <= 10) grade = 'D';
      else grade = 'F';

      return {
        success: true,
        data: {
          trackers: found,
          totalCount: found.length,
          categories: Array.from(categories),
          grade,
        },
        duration: Date.now() - start,
      };
    } catch (error) {
      return { success: false, error: getErrorMessage(error), duration: Date.now() - start };
    }
  },
};
