import net from 'node:net';
import dns from 'node:dns';
import { promisify } from 'node:util';
import type { CheckModule } from './index.js';
import { getErrorMessage } from '../utils/safeFetch.js';

const dnsLookup = promisify(dns.lookup);

const COMMON_PORTS: Array<{ port: number; service: string }> = [
  { port: 21, service: 'FTP' },
  { port: 22, service: 'SSH' },
  { port: 23, service: 'Telnet' },
  { port: 25, service: 'SMTP' },
  { port: 53, service: 'DNS' },
  { port: 80, service: 'HTTP' },
  { port: 110, service: 'POP3' },
  { port: 143, service: 'IMAP' },
  { port: 443, service: 'HTTPS' },
  { port: 445, service: 'SMB' },
  { port: 587, service: 'SMTP/TLS' },
  { port: 993, service: 'IMAPS' },
  { port: 995, service: 'POP3S' },
  { port: 1433, service: 'MSSQL' },
  { port: 1521, service: 'Oracle DB' },
  { port: 3306, service: 'MySQL' },
  { port: 3389, service: 'RDP' },
  { port: 5432, service: 'PostgreSQL' },
  { port: 5900, service: 'VNC' },
  { port: 6379, service: 'Redis' },
  { port: 8080, service: 'HTTP Proxy' },
  { port: 8443, service: 'HTTPS Alt' },
  { port: 27017, service: 'MongoDB' },
];

function scanPort(host: string, port: number, timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(timeoutMs);
    socket.on('connect', () => { socket.destroy(); resolve(true); });
    socket.on('timeout', () => { socket.destroy(); resolve(false); });
    socket.on('error', () => { socket.destroy(); resolve(false); });
    socket.connect(port, host);
  });
}

export const openPortsCheck: CheckModule = {
  id: 'open-ports',
  name: 'Open Ports',
  description: 'Scans common TCP ports to identify running services',
  category: 'network',
  icon: 'radio',
  run: async (target) => {
    const start = Date.now();
    try {
      let ip: string;
      if (target.isIP) {
        ip = target.hostname;
      } else {
        const resolved = await dnsLookup(target.hostname);
        ip = resolved.address;
      }

      const results = await Promise.all(
        COMMON_PORTS.map(async ({ port, service }) => {
          const isOpen = await scanPort(ip, port, 2000);
          return { port, service, isOpen };
        }),
      );

      const openPorts = results.filter((r) => r.isOpen);
      const closedPorts = results.filter((r) => !r.isOpen);

      return {
        success: true,
        data: {
          openPorts,
          closedPorts: closedPorts.map((p) => ({ port: p.port, service: p.service })),
          openCount: openPorts.length,
          scannedCount: COMMON_PORTS.length,
          ip,
        },
        duration: Date.now() - start,
      };
    } catch (error) {
      return { success: false, error: getErrorMessage(error), duration: Date.now() - start };
    }
  },
};
