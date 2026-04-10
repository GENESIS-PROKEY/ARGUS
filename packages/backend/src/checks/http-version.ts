import tls from 'node:tls';
import type { CheckModule } from './index.js';
import { safeFetch, getErrorMessage } from '../utils/safeFetch.js';
import { config } from '../config/index.js';

export const httpVersionCheck: CheckModule = {
  id: 'http-version',
  name: 'HTTP/2 & HTTP/3',
  description: 'Detects HTTP protocol versions supported by the server (HTTP/1.1, HTTP/2, HTTP/3)',
  category: 'performance',
  icon: 'zap',
  run: async (target) => {
    const start = Date.now();
    try {
      // Check HTTP/2 via ALPN negotiation
      let http2Supported = false;
      let alpnProtocol: string | null = null;

      try {
        const result = await new Promise<{ alpn: string; protocol: string }>((resolve, reject) => {
          const socket = tls.connect(
            {
              host: target.hostname,
              port: target.port ?? 443,
              servername: target.hostname,
              ALPNProtocols: ['h2', 'http/1.1'],
              rejectUnauthorized: false,
              timeout: config.CHECK_TIMEOUT_MS,
            },
            () => {
              const negotiated = socket.alpnProtocol || 'unknown';
              const tlsVersion = socket.getProtocol() ?? 'unknown';
              socket.destroy();
              resolve({ alpn: negotiated, protocol: tlsVersion });
            },
          );
          socket.on('error', reject);
          socket.on('timeout', () => { socket.destroy(); reject(new Error('timeout')); });
        });
        alpnProtocol = result.alpn;
        http2Supported = result.alpn === 'h2';
      } catch {
        // ALPN check failed
      }

      // Check HTTP/3 support via Alt-Svc header
      let http3Supported = false;
      let altSvc: string | null = null;
      try {
        const headRes = await safeFetch(target.url, { method: 'HEAD', timeoutMs: 5000 });
        altSvc = headRes.headers.get('alt-svc');
        if (altSvc && /h3/i.test(altSvc)) {
          http3Supported = true;
        }
      } catch {
        // ignore
      }

      // Determine HTTP/1.1 (always assumed as baseline)
      const http11Supported = true;

      return {
        success: true,
        data: {
          http11: http11Supported,
          http2: http2Supported,
          http3: http3Supported,
          alpnProtocol,
          altSvc,
          bestProtocol: http3Supported ? 'HTTP/3' : http2Supported ? 'HTTP/2' : 'HTTP/1.1',
        },
        duration: Date.now() - start,
      };
    } catch (error) {
      return { success: false, error: getErrorMessage(error), duration: Date.now() - start };
    }
  },
};
