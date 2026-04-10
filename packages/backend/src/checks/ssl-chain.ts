import tls from 'node:tls';
import type { CheckModule } from './index.js';
import { getErrorMessage } from '../utils/safeFetch.js';
import { config } from '../config/index.js';

interface CertInfo {
  subject: Record<string, string>;
  issuer: Record<string, string>;
  validFrom: string;
  validTo: string;
  serialNumber: string;
  fingerprint: string;
  fingerprint256: string;
  subjectaltname?: string;
  bits?: number;
  exponent?: string;
  modulus?: string;
}

function extractCertChain(socket: tls.TLSSocket): CertInfo[] {
  const chain: CertInfo[] = [];
  let cert = socket.getPeerCertificate(true);

  const seen = new Set<string>();
  while (cert && !seen.has(cert.fingerprint256)) {
    seen.add(cert.fingerprint256);
    chain.push({
      subject: cert.subject as unknown as Record<string, string>,
      issuer: cert.issuer as unknown as Record<string, string>,
      validFrom: cert.valid_from,
      validTo: cert.valid_to,
      serialNumber: cert.serialNumber,
      fingerprint: cert.fingerprint,
      fingerprint256: cert.fingerprint256,
      subjectaltname: cert.subjectaltname,
      bits: cert.bits,
      exponent: cert.exponent,
      modulus: cert.modulus,
    });
    const issuerCert = (cert as unknown as Record<string, unknown>)['issuerCertificate'] as tls.DetailedPeerCertificate | undefined;
    if (!issuerCert || issuerCert.fingerprint256 === cert.fingerprint256) break;
    cert = issuerCert;
  }
  return chain;
}

export const sslChainCheck: CheckModule = {
  id: 'ssl-chain',
  name: 'SSL Certificate Chain',
  description: 'Analyzes the full SSL/TLS certificate chain, expiry, and issuer trust',
  category: 'security',
  icon: 'lock',
  run: async (target) => {
    const start = Date.now();
    try {
      const result = await new Promise<{
        authorized: boolean;
        authorizationError?: string;
        protocol: string;
        chain: CertInfo[];
        expiryDays: number;
      }>((resolve, reject) => {
        const socket = tls.connect(
          {
            host: target.hostname,
            port: target.port ?? 443,
            servername: target.hostname,
            rejectUnauthorized: false,
            timeout: config.CHECK_TIMEOUT_MS,
          },
          () => {
            const cert = socket.getPeerCertificate();
            if (!cert || Object.keys(cert).length === 0) {
              socket.destroy();
              reject(new Error('No certificate presented by the server'));
              return;
            }

            const chain = extractCertChain(socket);
            const validTo = new Date(cert.valid_to);
            const expiryDays = Math.floor((validTo.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

            resolve({
              authorized: socket.authorized,
              authorizationError: socket.authorizationError?.message ?? socket.authorizationError?.toString() ?? undefined,
              protocol: socket.getProtocol() ?? 'unknown',
              chain,
              expiryDays,
            });
            socket.destroy();
          },
        );

        socket.on('error', (err) => {
          reject(new Error(`SSL connection failed: ${err.message}`));
        });

        socket.on('timeout', () => {
          socket.destroy();
          reject(new Error('SSL connection timed out'));
        });
      });

      return { success: true, data: result, duration: Date.now() - start };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error),
        duration: Date.now() - start,
      };
    }
  },
};
