import tls from 'node:tls';
import type { CheckModule } from './index.js';
import { getErrorMessage } from '../utils/safeFetch.js';
import { config } from '../config/index.js';

export const tlsCiphersCheck: CheckModule = {
  id: 'tls-ciphers',
  name: 'TLS Cipher Suites',
  description: 'Analyzes TLS cipher suite negotiation and identifies weak configurations',
  category: 'security',
  icon: 'key',
  run: async (target) => {
    const start = Date.now();
    try {
      const result = await new Promise<{
        protocol: string;
        cipher: tls.CipherNameAndProtocol;
        ephemeralKeyInfo: unknown;
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
            const cipher = socket.getCipher();
            const protocol = socket.getProtocol() ?? 'unknown';
            const ephemeralKeyInfo = socket.getEphemeralKeyInfo?.() ?? null;
            socket.destroy();
            resolve({ protocol, cipher, ephemeralKeyInfo });
          },
        );
        socket.on('error', reject);
        socket.on('timeout', () => { socket.destroy(); reject(new Error('TLS connection timed out')); });
      });

      // Analyze cipher strength
      const cipherName = result.cipher.name;
      const weakCiphers = /RC4|DES|3DES|MD5|NULL|EXPORT|anon/i;
      const isWeak = weakCiphers.test(cipherName);
      const supportsPFS = /ECDHE|DHE/i.test(cipherName);
      const usesAEAD = /GCM|CHACHA20|POLY1305|CCM/i.test(cipherName);

      let grade: string;
      if (result.protocol === 'TLSv1.3') grade = 'A+';
      else if (result.protocol === 'TLSv1.2' && !isWeak && supportsPFS && usesAEAD) grade = 'A';
      else if (result.protocol === 'TLSv1.2' && !isWeak) grade = 'B';
      else if (isWeak) grade = 'F';
      else grade = 'C';

      return {
        success: true,
        data: {
          protocol: result.protocol,
          cipher: {
            name: cipherName,
            standardName: result.cipher.standardName,
            version: result.cipher.version,
          },
          ephemeralKeyInfo: result.ephemeralKeyInfo,
          analysis: {
            isWeak,
            supportsPFS,
            usesAEAD,
            grade,
          },
        },
        duration: Date.now() - start,
      };
    } catch (error) {
      return { success: false, error: getErrorMessage(error), duration: Date.now() - start };
    }
  },
};
