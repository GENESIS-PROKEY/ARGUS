import dns from 'node:dns';
import { promisify } from 'node:util';
import type { CheckModule } from './index.js';
import { safeFetch, getErrorMessage } from '../utils/safeFetch.js';

const dnsLookup = promisify(dns.lookup);

export const ipInfoCheck: CheckModule = {
  id: 'ip-info',
  name: 'IP Address Info',
  description: 'Resolves IP address and retrieves geolocation, ISP, and network information',
  category: 'network',
  icon: 'map-pin',
  run: async (target) => {
    const start = Date.now();
    try {
      // Resolve hostname to IP
      let ip: string;
      if (target.isIP) {
        ip = target.hostname;
      } else {
        const resolved = await dnsLookup(target.hostname);
        ip = resolved.address;
      }

      // Get geolocation data from ip-api.com (free, no key needed)
      const response = await safeFetch(
        `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,asname,query`,
      );
      const data = await response.json() as Record<string, unknown>;

      if (data['status'] === 'fail') {
        return {
          success: false,
          error: `Could not retrieve IP info: ${String(data['message'] ?? 'Unknown reason')}`,
          duration: Date.now() - start,
        };
      }

      return {
        success: true,
        data: {
          ip,
          ...data,
        },
        duration: Date.now() - start,
      };
    } catch (error) {
      return { success: false, error: getErrorMessage(error), duration: Date.now() - start };
    }
  },
};
