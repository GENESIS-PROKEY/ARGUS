import type { RendererProps } from './index';
import { KV, Tag } from './Shared';

export function WhoisRenderer({ data }: RendererProps) {
  const domain = data['domainName'] as string;
  const registrar = data['registrar'] as string;
  const creation = data['creationDate'] as string;
  const expiration = data['expirationDate'] as string;
  const updated = data['updatedDate'] as string;
  const org = data['registrantOrg'] as string;
  const country = data['registrantCountry'] as string;

  const formatDate = (d?: string) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); }
    catch { return d; }
  };

  // Domain age
  let ageStr = '';
  if (creation) {
    try {
      const years = Math.floor((Date.now() - new Date(creation).getTime()) / (365.25 * 86400000));
      ageStr = `${years} years old`;
    } catch { /* skip */ }
  }

  return (
    <div className="space-y-1">
      {ageStr && <Tag variant="cyan">{ageStr}</Tag>}
      <KV label="Domain" value={domain} mono />
      <KV label="Registrar" value={registrar} />
      <KV label="Created" value={formatDate(creation)} />
      <KV label="Expires" value={formatDate(expiration)} />
      <KV label="Updated" value={formatDate(updated)} />
      <KV label="Organization" value={org} />
      <KV label="Country" value={country} />
      <KV label="DNSSEC" value={data['dnssec'] as string} />
    </div>
  );
}
