import type { RendererProps } from './index';
import { KV, Tag } from './Shared';

/* ─── Country code → flag emoji ─── */
function countryFlag(code: string | undefined): string {
  if (!code || code.length !== 2) return '🌍';
  const offset = 0x1F1E6;
  return String.fromCodePoint(
    code.charCodeAt(0) - 65 + offset,
    code.charCodeAt(1) - 65 + offset,
  );
}

export function IpInfoRenderer({ data }: RendererProps) {
  const ip = data['ip'] as string ?? data['query'] as string ?? '';
  const lat = data['lat'] as number | undefined;
  const lon = data['lon'] as number | undefined;
  const countryCode = (data['countryCode'] as string)?.toUpperCase();
  const flag = countryFlag(countryCode);
  const hasCoords = lat !== undefined && lon !== undefined;

  return (
    <div className="space-y-3">
      {/* Header: flag + IP + location */}
      <div className="flex items-center gap-3">
        <span className="text-3xl">{flag}</span>
        <div>
          <p className="text-sm font-mono font-bold text-argus-accent-cyan">{ip}</p>
          <p className="text-xs text-argus-text-muted">
            {[data['city'], data['regionName'], data['country']].filter(Boolean).join(', ')}
          </p>
        </div>
      </div>

      {/* Map embed */}
      {hasCoords && (
        <div className="rounded-lg overflow-hidden border border-argus-card-border/30 h-40">
          <iframe
            title="Server Location"
            width="100%"
            height="100%"
            style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(0.95) contrast(1.1)' }}
            loading="lazy"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.5},${lat - 0.3},${lon + 0.5},${lat + 0.3}&layer=mapnik&marker=${lat},${lon}`}
          />
        </div>
      )}

      {/* Details */}
      <div className="space-y-1">
        <KV label="ISP" value={data['isp'] as string} />
        <KV label="Organization" value={data['org'] as string} />
        <KV label="ASN" value={data['as'] as string} mono />
        <KV label="Timezone" value={data['timezone'] as string} />
        {hasCoords && (
          <KV label="Coordinates" value={`${lat.toFixed(4)}, ${lon.toFixed(4)}`} mono />
        )}
      </div>
    </div>
  );
}

export function ServerInfoRenderer({ data }: RendererProps) {
  return (
    <div className="space-y-1">
      <KV label="IP Address" value={<span className="font-mono">{data['ip'] as string}</span>} />
      <KV label="ISP" value={data['isp'] as string} />
      <KV label="ASN" value={data['asn'] as string} mono />
      <KV label="ASN Name" value={data['asnName'] as string} />
      <KV label="Server" value={data['server'] as string ? <Tag variant="cyan">{data['server'] as string}</Tag> : '—'} />
      {data['poweredBy'] && <KV label="Powered By" value={<Tag variant="purple">{data['poweredBy'] as string}</Tag>} />}
      {data['cdn'] && <KV label="CDN" value={<Tag variant="green">{data['cdn'] as string}</Tag>} />}
      <KV label="Reverse DNS" value={data['reverseDns'] as string} mono />
    </div>
  );
}
