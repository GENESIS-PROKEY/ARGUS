import net from 'node:net';
import type { ParsedTarget } from '@argus/shared';

const PRIVATE_RANGES = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^0\./,
  /^169\.254\./,
  /^::1$/,
  /^fc00:/i,
  /^fe80:/i,
  /^fd/i,
];

function isPrivateIP(ip: string): boolean {
  return PRIVATE_RANGES.some((range) => range.test(ip));
}

export type ParseResult =
  | { success: true; data: ParsedTarget }
  | { success: false; error: string };

export function parseTarget(input: string): ParseResult {
  const trimmed = input.trim().toLowerCase();

  if (!trimmed) {
    return { success: false, error: 'Please enter a URL or domain name' };
  }

  const isIPv4 = net.isIPv4(trimmed);
  const isIPv6 = net.isIPv6(trimmed);
  const isIP = isIPv4 || isIPv6;

  if (isIP && isPrivateIP(trimmed)) {
    return {
      success: false,
      error: 'Private and reserved IP addresses cannot be scanned for security reasons',
    };
  }

  let hostname: string;
  let protocol = 'https';
  let port: number | undefined;

  try {
    if (isIP) {
      hostname = trimmed;
    } else if (trimmed.includes('://')) {
      const parsed = new URL(trimmed);
      hostname = parsed.hostname;
      protocol = parsed.protocol.replace(':', '');
      port = parsed.port ? parseInt(parsed.port, 10) : undefined;
    } else {
      const parsed = new URL(`https://${trimmed}`);
      hostname = parsed.hostname;
      port = parsed.port ? parseInt(parsed.port, 10) : undefined;
    }
  } catch {
    return { success: false, error: 'Invalid URL or domain format. Try something like "example.com"' };
  }

  if (!hostname || hostname === 'localhost') {
    return { success: false, error: 'Localhost cannot be scanned' };
  }

  const domainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/;
  if (!isIP && !domainRegex.test(hostname)) {
    return { success: false, error: 'Invalid domain format' };
  }

  const url = `${protocol}://${hostname}${port ? `:${port}` : ''}`;

  return {
    success: true,
    data: { raw: input, hostname, port, protocol, url, isIP },
  };
}
