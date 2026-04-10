import type { CheckModule } from './index.js';
import { getErrorMessage } from '../utils/safeFetch.js';
import dns from 'node:dns';
import net from 'node:net';

function resolveAAAA(hostname: string): Promise<string[]> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve([]), 5000);
    dns.resolve6(hostname, (err, addresses) => {
      clearTimeout(timeout);
      resolve(err ? [] : addresses ?? []);
    });
  });
}

function resolve4(hostname: string): Promise<string[]> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve([]), 5000);
    dns.resolve4(hostname, (err, addresses) => {
      clearTimeout(timeout);
      resolve(err ? [] : addresses ?? []);
    });
  });
}

function tcpConnect(host: string, port: number, timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port, timeout: timeoutMs }, () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('error', () => { socket.destroy(); resolve(false); });
    socket.on('timeout', () => { socket.destroy(); resolve(false); });
  });
}

export const ipv6SupportCheck: CheckModule = {
  id: 'ipv6-support',
  name: 'IPv6 Support',
  description: 'Checks for AAAA DNS records and IPv6 connectivity',
  category: 'infrastructure',
  icon: 'network',
  run: async (target) => {
    const start = Date.now();
    try {
      const [aaaa, ipv4] = await Promise.all([
        resolveAAAA(target.hostname),
        resolve4(target.hostname),
      ]);

      const hasAAAARecord = aaaa.length > 0;
      const ipv6Address = hasAAAARecord ? aaaa[0] : null;
      const ipv4Address = ipv4.length > 0 ? ipv4[0] : null;

      let reachable = false;
      let httpsSupported = false;

      if (hasAAAARecord && ipv6Address) {
        reachable = await tcpConnect(ipv6Address, 80, 3000);
        httpsSupported = await tcpConnect(ipv6Address, 443, 3000);
      }

      let grade: string;
      if (hasAAAARecord && httpsSupported) grade = 'A';
      else if (hasAAAARecord && reachable) grade = 'B';
      else if (hasAAAARecord) grade = 'C';
      else grade = 'F';

      return {
        success: true,
        data: {
          hasAAAARecord,
          ipv6Address,
          ipv4Address,
          reachable,
          httpsSupported,
          grade,
        },
        duration: Date.now() - start,
      };
    } catch (error) {
      return { success: false, error: getErrorMessage(error), duration: Date.now() - start };
    }
  },
};
