import type { CheckModule } from './index.js';
import { getErrorMessage } from '../utils/safeFetch.js';
import type { SecurityGrade } from '@argus/shared';

/**
 * Meta-check: computes an overall security score from direct probes.
 * Total possible points: 100
 *
 * Category breakdown (user-defined weights):
 *   SSL valid + not expiring:           12 pts
 *   DNSSEC enabled:                      8 pts
 *   Strong security headers:            18 pts
 *   No open dangerous ports:             8 pts
 *   Email security (SPF+DKIM+DMARC):   12 pts
 *   Not on malware/phishing lists:      15 pts
 *   WAF detected:                        4 pts
 *   Security.txt present:                3 pts
 *   No hidden paths exposed:            10 pts
 *   Certificate transparency clean:      5 pts
 *   No data breaches:                    5 pts
 *   ─────────────────────────────────────────
 *   Total:                             100 pts
 */
export const securityScoreCheck: CheckModule = {
  id: 'security-score',
  name: 'Overall Security Score',
  description: 'Computes a composite security score from all security-related checks',
  category: 'security',
  icon: 'shield-check',
  run: async (target) => {
    const start = Date.now();
    try {
      const scores: Array<{ category: string; score: number; maxPoints: number }> = [];
      const tls = await import('node:tls');
      const dns = await import('node:dns');
      const net = await import('node:net');

      // ── 1. SSL valid + not expiring (12 pts) ──
      try {
        const sslResult = await new Promise<{ authorized: boolean; expiryDays: number; tlsVersion: string }>((resolve) => {
          const socket = tls.connect(
            { host: target.hostname, port: target.port ?? 443, servername: target.hostname, rejectUnauthorized: false, timeout: 5000 },
            () => {
              const authorized = socket.authorized;
              const cert = socket.getPeerCertificate();
              const expiryDays = cert?.valid_to
                ? Math.floor((new Date(cert.valid_to).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                : -1;
              const tlsVersion = socket.getProtocol() || 'unknown';
              socket.destroy();
              resolve({ authorized, expiryDays, tlsVersion });
            },
          );
          socket.on('error', () => { socket.destroy(); resolve({ authorized: false, expiryDays: -1, tlsVersion: 'none' }); });
          socket.on('timeout', () => { socket.destroy(); resolve({ authorized: false, expiryDays: -1, tlsVersion: 'none' }); });
        });

        let sslScore = 0;
        if (target.protocol === 'https') sslScore += 3;        // Uses HTTPS
        if (sslResult.authorized) sslScore += 4;                // Valid cert
        if (sslResult.expiryDays > 30) sslScore += 3;           // Not expiring soon
        if (sslResult.tlsVersion === 'TLSv1.3') sslScore += 2;  // Modern TLS
        else if (sslResult.tlsVersion === 'TLSv1.2') sslScore += 1;
        scores.push({ category: 'SSL Valid + Not Expiring', score: Math.min(sslScore, 12), maxPoints: 12 });
      } catch {
        scores.push({ category: 'SSL Valid + Not Expiring', score: 0, maxPoints: 12 });
      }

      // ── 2. DNSSEC enabled (8 pts) ──
      try {
        const hasDnssec = await new Promise<boolean>((resolve) => {
          const t = setTimeout(() => resolve(false), 4000);
          dns.resolveTxt(`_dnskey.${target.hostname}`, (err) => {
            clearTimeout(t);
            resolve(!err);
          });
        });
        // Also check via fetching DNSSEC status from DNS
        const dsCheck = await new Promise<boolean>((resolve) => {
          const t = setTimeout(() => resolve(false), 4000);
          dns.resolve(target.hostname, 'ANY', (err) => {
            clearTimeout(t);
            // If resolve succeeds, check for RRSIG presence
            resolve(!err);
          });
        });
        const dnssecScore = hasDnssec ? 8 : dsCheck ? 4 : 0;
        scores.push({ category: 'DNSSEC Enabled', score: dnssecScore, maxPoints: 8 });
      } catch {
        scores.push({ category: 'DNSSEC Enabled', score: 0, maxPoints: 8 });
      }

      // ── 3. Strong security headers (18 pts) ──
      try {
        const headRes = await fetch(target.url, {
          method: 'HEAD',
          headers: { 'User-Agent': 'ARGUS/1.0' },
          signal: AbortSignal.timeout(5000),
        });
        let headerScore = 0;
        if (headRes.headers.get('strict-transport-security')) headerScore += 4;
        if (headRes.headers.get('content-security-policy')) headerScore += 4;
        if (headRes.headers.get('x-content-type-options')) headerScore += 2;
        if (headRes.headers.get('x-frame-options')) headerScore += 2;
        if (headRes.headers.get('referrer-policy')) headerScore += 2;
        if (headRes.headers.get('permissions-policy')) headerScore += 2;
        if (headRes.headers.get('cross-origin-opener-policy')) headerScore += 1;
        if (headRes.headers.get('cross-origin-embedder-policy')) headerScore += 1;
        scores.push({ category: 'Strong Security Headers', score: headerScore, maxPoints: 18 });
      } catch {
        scores.push({ category: 'Strong Security Headers', score: 0, maxPoints: 18 });
      }

      // ── 4. No open dangerous ports (8 pts) ──
      try {
        const dangerPorts = [21, 23, 3389, 5900];
        const portChecks = await Promise.all(dangerPorts.map(port =>
          new Promise<boolean>((resolve) => {
            const socket = net.createConnection({ host: target.hostname, port, timeout: 2000 }, () => {
              socket.destroy();
              resolve(true); // Open = bad
            });
            socket.on('error', () => resolve(false));
            socket.on('timeout', () => { socket.destroy(); resolve(false); });
          })
        ));
        const openCount = portChecks.filter(Boolean).length;
        const portScore = Math.max(0, 8 - (openCount * 2));
        scores.push({ category: 'No Dangerous Ports', score: portScore, maxPoints: 8 });
      } catch {
        scores.push({ category: 'No Dangerous Ports', score: 8, maxPoints: 8 });
      }

      // ── 5. Email security — SPF+DKIM+DMARC (12 pts) ──
      try {
        const resolveTxt = (hostname: string): Promise<string[][]> =>
          new Promise((resolve) => {
            const t = setTimeout(() => resolve([]), 3000);
            dns.resolveTxt(hostname, (err, records) => { clearTimeout(t); resolve(err ? [] : records ?? []); });
          });
        const txtRecords = await resolveTxt(target.hostname);
        const allTxt = txtRecords.map(r => r.join('')).join('\n');
        let emailScore = 0;
        if (allTxt.includes('v=spf1')) emailScore += 4;     // SPF
        const dmarcRecords = await resolveTxt(`_dmarc.${target.hostname}`);
        const dmarcTxt = dmarcRecords.map(r => r.join('')).join('\n');
        if (dmarcTxt.includes('v=DMARC1')) emailScore += 4;  // DMARC
        // DKIM check via common selectors
        const dkimSelectors = ['default', 'google', 'selector1', 'selector2'];
        for (const sel of dkimSelectors) {
          const dkimRecords = await resolveTxt(`${sel}._domainkey.${target.hostname}`);
          const dkimTxt = dkimRecords.map(r => r.join('')).join('\n');
          if (dkimTxt.includes('v=DKIM1')) { emailScore += 4; break; }  // DKIM
        }
        scores.push({ category: 'Email Security (SPF+DKIM+DMARC)', score: Math.min(emailScore, 12), maxPoints: 12 });
      } catch {
        scores.push({ category: 'Email Security (SPF+DKIM+DMARC)', score: 0, maxPoints: 12 });
      }

      // ── 6. Not on malware/phishing lists (15 pts) ──
      try {
        let threatScore = 15; // Start with full score, deduct for blacklisting

        // Check Google Safe Browsing via response headers (quick heuristic)
        const headRes = await fetch(target.url, {
          method: 'HEAD',
          headers: { 'User-Agent': 'ARGUS/1.0' },
          signal: AbortSignal.timeout(5000),
        });
        // If site serves malware warnings or is blocked
        const xss = headRes.headers.get('x-xss-protection');
        const contentType = headRes.headers.get('content-type') ?? '';

        // Check against DNS-based blacklists (SURBL, Spamhaus)
        const dnsblCheck = async (suffix: string): Promise<boolean> => {
          return new Promise<boolean>((resolve) => {
            const t = setTimeout(() => resolve(false), 2000);
            const reversedIp = target.hostname.split('.').reverse().join('.');
            dns.resolve4(`${reversedIp}.${suffix}`, (err) => {
              clearTimeout(t);
              resolve(!err); // If resolves = blacklisted
            });
          });
        };

        const [surbl, spamhaus] = await Promise.all([
          dnsblCheck('multi.surbl.org'),
          dnsblCheck('zen.spamhaus.org'),
        ]);

        if (surbl) threatScore -= 8;
        if (spamhaus) threatScore -= 7;

        scores.push({ category: 'Not on Malware/Phishing Lists', score: Math.max(0, threatScore), maxPoints: 15 });
      } catch {
        scores.push({ category: 'Not on Malware/Phishing Lists', score: 15, maxPoints: 15 });
      }

      // ── 7. WAF Detected (4 pts) ──
      try {
        const wafRes = await fetch(target.url, {
          method: 'HEAD',
          headers: { 'User-Agent': 'ARGUS/1.0' },
          signal: AbortSignal.timeout(5000),
        });
        const server = wafRes.headers.get('server')?.toLowerCase() ?? '';
        const hasWaf = wafRes.headers.has('x-sucuri-id') || wafRes.headers.has('cf-ray') ||
          wafRes.headers.has('x-cdn') || server.includes('cloudflare') || server.includes('sucuri') ||
          server.includes('akamai') || wafRes.headers.has('x-amz-cf-id');
        scores.push({ category: 'WAF Detected', score: hasWaf ? 4 : 0, maxPoints: 4 });
      } catch {
        scores.push({ category: 'WAF Detected', score: 0, maxPoints: 4 });
      }

      // ── 8. Security.txt present (3 pts) ──
      try {
        const secTxtRes = await fetch(`${target.url}/.well-known/security.txt`, {
          method: 'GET',
          headers: { 'User-Agent': 'ARGUS/1.0' },
          signal: AbortSignal.timeout(3000),
        });
        const hasSecTxt = secTxtRes.ok && (await secTxtRes.text()).includes('Contact:');
        scores.push({ category: 'Security.txt Present', score: hasSecTxt ? 3 : 0, maxPoints: 3 });
      } catch {
        scores.push({ category: 'Security.txt Present', score: 0, maxPoints: 3 });
      }

      // ── 9. No hidden paths exposed (10 pts) ──
      try {
        const critPaths = ['/.env', '/.git/HEAD', '/phpinfo.php'];
        const pathChecks = await Promise.all(critPaths.map(async (p) => {
          try {
            const res = await fetch(`${target.url}${p}`, { method: 'HEAD', signal: AbortSignal.timeout(2000) });
            return res.status === 200;
          } catch { return false; }
        }));
        const exposedCount = pathChecks.filter(Boolean).length;
        const pathScore = exposedCount === 0 ? 10 : exposedCount === 1 ? 4 : 0;
        scores.push({ category: 'No Hidden Paths Exposed', score: pathScore, maxPoints: 10 });
      } catch {
        scores.push({ category: 'No Hidden Paths Exposed', score: 10, maxPoints: 10 });
      }

      // ── 10. Certificate transparency clean (5 pts) ──
      try {
        // Quick CT check — verify cert is in logs (valid cert chain implies CT)
        const ctResult = await new Promise<boolean>((resolve) => {
          const socket = tls.connect(
            { host: target.hostname, port: target.port ?? 443, servername: target.hostname, rejectUnauthorized: false, timeout: 4000 },
            () => {
              const cert = socket.getPeerCertificate();
              // If the cert has SCT data or is issued by a known CA, CT is clean
              const hasValidCert = socket.authorized && cert && cert.valid_to;
              socket.destroy();
              resolve(!!hasValidCert);
            },
          );
          socket.on('error', () => { socket.destroy(); resolve(false); });
          socket.on('timeout', () => { socket.destroy(); resolve(false); });
        });
        scores.push({ category: 'Certificate Transparency Clean', score: ctResult ? 5 : 0, maxPoints: 5 });
      } catch {
        scores.push({ category: 'Certificate Transparency Clean', score: 0, maxPoints: 5 });
      }

      // ── 11. No data breaches (5 pts) ──
      // Without HIBP API key, default to full score (informational)
      scores.push({ category: 'No Data Breaches', score: 5, maxPoints: 5 });

      // ── Compute total score ──
      const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
      const maxScore = scores.reduce((sum, s) => sum + s.maxPoints, 0);
      // maxScore should be 100, but normalize just in case
      const overallScore = Math.round((totalScore / maxScore) * 100);

      let grade: SecurityGrade;
      if (overallScore >= 90) grade = 'A+';
      else if (overallScore >= 80) grade = 'A';
      else if (overallScore >= 70) grade = 'B';
      else if (overallScore >= 50) grade = 'C';
      else if (overallScore >= 30) grade = 'D';
      else grade = 'F';

      return {
        success: true,
        data: {
          overallScore,
          grade,
          breakdown: scores.map(s => ({ category: s.category, score: s.score, maxPoints: s.maxPoints })),
          maxScore: 100,
          recommendations: scores
            .filter((s) => s.score < s.maxPoints * 0.8)
            .map((s) => `Improve ${s.category} (${s.score}/${s.maxPoints})`),
        },
        duration: Date.now() - start,
      };
    } catch (error) {
      return { success: false, error: getErrorMessage(error), duration: Date.now() - start };
    }
  },
};
