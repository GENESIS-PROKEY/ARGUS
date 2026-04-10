import type { CheckModule } from './index.js';
import { safeFetch, getErrorMessage } from '../utils/safeFetch.js';

interface CookieInfo {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  expires?: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite?: string;
}

function parseCookie(cookieStr: string): CookieInfo {
  const parts = cookieStr.split(';').map((p) => p.trim());
  const [nameValue = '', ...attrs] = parts;
  const eqIndex = nameValue.indexOf('=');
  const name = eqIndex > -1 ? nameValue.slice(0, eqIndex).trim() : nameValue.trim();
  const value = eqIndex > -1 ? nameValue.slice(eqIndex + 1).trim() : '';

  const cookie: CookieInfo = { name, value, httpOnly: false, secure: false };

  for (const attr of attrs) {
    const lower = attr.toLowerCase();
    if (lower === 'httponly') cookie.httpOnly = true;
    else if (lower === 'secure') cookie.secure = true;
    else if (lower.startsWith('domain=')) cookie.domain = attr.split('=')[1]?.trim();
    else if (lower.startsWith('path=')) cookie.path = attr.split('=')[1]?.trim();
    else if (lower.startsWith('expires=')) cookie.expires = attr.split('=').slice(1).join('=').trim();
    else if (lower.startsWith('samesite=')) cookie.sameSite = attr.split('=')[1]?.trim();
  }

  return cookie;
}

export const cookiesCheck: CheckModule = {
  id: 'cookies',
  name: 'Cookies',
  description: 'Inspects cookies set by the server including security flags',
  category: 'security',
  icon: 'cookie',
  run: async (target) => {
    const start = Date.now();
    try {
      const response = await safeFetch(target.url, { followRedirects: false });

      const rawCookies = response.headers.getSetCookie?.() ?? [];
      const cookies = rawCookies.map(parseCookie);

      const securityIssues: string[] = [];
      for (const cookie of cookies) {
        if (!cookie.secure) securityIssues.push(`"${cookie.name}" missing Secure flag`);
        if (!cookie.httpOnly) securityIssues.push(`"${cookie.name}" missing HttpOnly flag`);
        if (!cookie.sameSite) securityIssues.push(`"${cookie.name}" missing SameSite attribute`);
      }

      return {
        success: true,
        data: {
          cookies,
          count: cookies.length,
          securityIssues,
          hasIssues: securityIssues.length > 0,
        },
        duration: Date.now() - start,
      };
    } catch (error) {
      return { success: false, error: getErrorMessage(error), duration: Date.now() - start };
    }
  },
};
