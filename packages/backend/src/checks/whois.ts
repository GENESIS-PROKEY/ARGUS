import type { CheckModule } from './index.js';
import { getErrorMessage } from '../utils/safeFetch.js';

export const whoisCheck: CheckModule = {
  id: 'whois',
  name: 'WHOIS / Domain Info',
  description: 'Retrieves domain registration, registrar, and expiration information',
  category: 'network',
  icon: 'scroll',
  run: async (target) => {
    const start = Date.now();
    try {
      if (target.isIP) {
        return {
          success: false,
          error: 'WHOIS lookups are only available for domain names, not IP addresses',
          duration: Date.now() - start,
        };
      }

      const whoisJson = await import('whois-json');
      const lookup = whoisJson.default ?? whoisJson;
      const rawResult = await lookup(target.hostname);

      // Handle both array and object responses
      const result = Array.isArray(rawResult) ? rawResult[0] : rawResult;

      if (!result || Object.keys(result as object).length === 0) {
        return {
          success: false,
          error: 'No WHOIS data found for this domain',
          duration: Date.now() - start,
        };
      }

      const data = result as Record<string, unknown>;

      return {
        success: true,
        data: {
          domainName: data['domainName'] ?? target.hostname,
          registrar: data['registrar'] ?? null,
          registrarUrl: data['registrarUrl'] ?? null,
          creationDate: data['creationDate'] ?? data['createdDate'] ?? null,
          expirationDate: data['registrarRegistrationExpirationDate'] ?? data['registryExpiryDate'] ?? null,
          updatedDate: data['updatedDate'] ?? null,
          status: data['domainStatus'] ?? data['status'] ?? null,
          nameServers: data['nameServer'] ?? null,
          registrantOrg: data['registrantOrganization'] ?? null,
          registrantCountry: data['registrantCountry'] ?? null,
          dnssec: data['dnssec'] ?? null,
          raw: data,
        },
        duration: Date.now() - start,
      };
    } catch (error) {
      return { success: false, error: getErrorMessage(error), duration: Date.now() - start };
    }
  },
};
