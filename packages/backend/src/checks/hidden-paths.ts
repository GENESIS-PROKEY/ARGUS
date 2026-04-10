import type { CheckModule } from './index.js';
import { getErrorMessage } from '../utils/safeFetch.js';

interface PathResult {
  path: string;
  status: number | null;
  statusText: string;
  risk: 'critical' | 'medium' | 'safe' | 'timeout';
}

const SENSITIVE_PATHS = [
  '/.env', '/.git/HEAD', '/.git/config', '/wp-admin', '/wp-login.php',
  '/admin', '/administrator', '/login', '/phpmyadmin', '/phpinfo.php',
  '/config.php', '/backup', '/db', '/database', '/.DS_Store',
  '/api/v1', '/api/swagger', '/swagger.json', '/openapi.json',
  '/actuator', '/actuator/health', '/metrics', '/debug',
  '/.well-known/security.txt',
];

const CRITICAL_PATHS = ['/.env', '/.git/HEAD', '/.git/config', '/phpinfo.php', '/phpmyadmin'];

export const hiddenPathsCheck: CheckModule = {
  id: 'hidden-paths',
  name: 'Hidden Path Exposure',
  description: 'Checks for exposed sensitive files and directories',
  category: 'security',
  icon: 'folder-search',
  run: async (target) => {
    const start = Date.now();
    try {
      const results = await Promise.allSettled(
        SENSITIVE_PATHS.map(async (path): Promise<PathResult> => {
          try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 3000);
            const res = await fetch(`${target.url}${path}`, {
              method: 'HEAD',
              headers: { 'User-Agent': 'ARGUS/1.0' },
              signal: controller.signal,
              redirect: 'follow',
            });
            clearTimeout(timeout);

            let risk: PathResult['risk'] = 'safe';
            if (res.status === 200) {
              risk = CRITICAL_PATHS.includes(path) ? 'critical' : 'medium';
            } else if (res.status === 403) {
              risk = 'medium';
            }

            return { path, status: res.status, statusText: res.statusText, risk };
          } catch {
            return { path, status: null, statusText: 'Timeout', risk: 'timeout' };
          }
        }),
      );

      const pathResults: PathResult[] = results
        .filter((r): r is PromiseFulfilledResult<PathResult> => r.status === 'fulfilled')
        .map(r => r.value);

      const exposed = pathResults.filter(r => r.status === 200);
      const forbidden = pathResults.filter(r => r.status === 403);
      const criticalExposed = exposed.filter(r => CRITICAL_PATHS.includes(r.path));

      let riskLevel: 'none' | 'low' | 'medium' | 'high' = 'none';
      if (criticalExposed.length > 0) riskLevel = 'high';
      else if (exposed.length >= 3) riskLevel = 'high';
      else if (exposed.length > 0) riskLevel = 'medium';
      else if (forbidden.length > 0) riskLevel = 'low';

      let grade: string;
      if (riskLevel === 'none') grade = 'A';
      else if (riskLevel === 'low') grade = 'B';
      else if (riskLevel === 'medium') grade = 'D';
      else grade = 'F';

      return {
        success: true,
        data: {
          results: pathResults,
          exposed: exposed.map(r => r.path),
          totalChecked: SENSITIVE_PATHS.length,
          exposedCount: exposed.length,
          forbiddenCount: forbidden.length,
          riskLevel,
          grade,
          criticalExposures: criticalExposed.map(r => r.path),
        },
        duration: Date.now() - start,
      };
    } catch (error) {
      return { success: false, error: getErrorMessage(error), duration: Date.now() - start };
    }
  },
};
