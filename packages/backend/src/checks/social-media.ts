import type { CheckModule } from './index.js';
import { safeFetch, getErrorMessage } from '../utils/safeFetch.js';

interface SocialPresence {
  platform: string;
  url: string;
  found: boolean;
}

export const socialMediaCheck: CheckModule = {
  id: 'social-media',
  name: 'Social Media Presence',
  description: 'Detects social media links and profiles referenced on the website',
  category: 'content',
  icon: 'share-2',
  run: async (target) => {
    const start = Date.now();
    try {
      const response = await safeFetch(target.url);
      const html = await response.text();

      const socialPatterns: Array<{ platform: string; pattern: RegExp }> = [
        { platform: 'Twitter/X', pattern: /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)/gi },
        { platform: 'Facebook', pattern: /(?:https?:\/\/)?(?:www\.)?facebook\.com\/([a-zA-Z0-9._-]+)/gi },
        { platform: 'Instagram', pattern: /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9._]+)/gi },
        { platform: 'LinkedIn', pattern: /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:company|in)\/([a-zA-Z0-9_-]+)/gi },
        { platform: 'YouTube', pattern: /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:c\/|channel\/|@)([a-zA-Z0-9_-]+)/gi },
        { platform: 'GitHub', pattern: /(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/gi },
        { platform: 'TikTok', pattern: /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@([a-zA-Z0-9._]+)/gi },
        { platform: 'Pinterest', pattern: /(?:https?:\/\/)?(?:www\.)?pinterest\.com\/([a-zA-Z0-9_-]+)/gi },
        { platform: 'Reddit', pattern: /(?:https?:\/\/)?(?:www\.)?reddit\.com\/(?:r|u|user)\/([a-zA-Z0-9_-]+)/gi },
        { platform: 'Discord', pattern: /(?:https?:\/\/)?(?:www\.)?discord\.(?:gg|com\/invite)\/([a-zA-Z0-9_-]+)/gi },
        { platform: 'Telegram', pattern: /(?:https?:\/\/)?(?:www\.)?t\.me\/([a-zA-Z0-9_]+)/gi },
        { platform: 'Medium', pattern: /(?:https?:\/\/)?(?:www\.)?medium\.com\/@?([a-zA-Z0-9._-]+)/gi },
      ];

      const found: Array<{ platform: string; handle: string; url: string }> = [];
      const seen = new Set<string>();

      for (const { platform, pattern } of socialPatterns) {
        let match: RegExpExecArray | null;
        while ((match = pattern.exec(html)) !== null) {
          const fullUrl = match[0].startsWith('http') ? match[0] : `https://${match[0]}`;
          const handle = match[1] ?? '';
          const key = `${platform}:${handle.toLowerCase()}`;
          if (!seen.has(key) && handle.length > 1) {
            seen.add(key);
            found.push({ platform, handle, url: fullUrl });
          }
        }
      }

      // Group by platform
      const byPlatform: Record<string, string[]> = {};
      for (const entry of found) {
        if (!byPlatform[entry.platform]) byPlatform[entry.platform] = [];
        byPlatform[entry.platform]!.push(entry.handle);
      }

      return {
        success: true,
        data: {
          profiles: found,
          byPlatform,
          totalFound: found.length,
          platformCount: Object.keys(byPlatform).length,
        },
        duration: Date.now() - start,
      };
    } catch (error) {
      return { success: false, error: getErrorMessage(error), duration: Date.now() - start };
    }
  },
};
