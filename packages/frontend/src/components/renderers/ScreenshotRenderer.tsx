import type { RendererProps } from './index';
import { EmptyState, Tag } from './Shared';
import { useState } from 'react';
import { ExternalLink, Camera } from 'lucide-react';

export function ScreenshotRenderer({ data }: RendererProps) {
  const screenshotUrl = data['screenshotUrl'] as string | null;
  const source = data['source'] as string ?? '';
  const perfScore = data['performanceScore'] as number | null;
  const domain = data['domain'] as string ?? '';
  const [imgError, setImgError] = useState(false);

  // If we have a valid screenshot (base64 or URL), show it
  if (screenshotUrl && !imgError) {
    return (
      <div className="space-y-2">
        <div className="rounded-lg overflow-hidden border border-argus-card-border/30 bg-argus-bg-deep">
          <img
            src={screenshotUrl}
            alt="Site screenshot"
            className="w-full h-auto"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <Tag variant="cyan">{source}</Tag>
          {perfScore !== null && (
            <Tag variant={perfScore >= 90 ? 'green' : perfScore >= 50 ? 'amber' : 'red'}>
              Perf: {perfScore}/100
            </Tag>
          )}
        </div>
      </div>
    );
  }

  // Fallback: show a live site preview via multiple free services
  if (domain) {
    const previewServices = [
      { name: 'Screenshot Machine', url: `https://api.screenshotmachine.com?key=free&url=https://${domain}&dimension=1024x768&format=png` },
      { name: 'Microlink', url: `https://api.microlink.io/?url=https://${domain}&screenshot=true&meta=false&embed=screenshot.url` },
    ];

    return (
      <div className="space-y-3">
        {/* Google cache/preview embed */}
        <div className="rounded-lg overflow-hidden border border-argus-card-border/30 bg-white relative" style={{ height: '240px' }}>
          <iframe
            title={`Preview of ${domain}`}
            src={`https://${domain}`}
            className="w-full h-full pointer-events-none"
            style={{ 
              transform: 'scale(0.5)', 
              transformOrigin: 'top left',
              width: '200%',
              height: '480px',
            }}
            loading="lazy"
            sandbox="allow-same-origin"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-argus-bg-deep/90 via-transparent to-transparent" />
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Tag variant="neutral">
            <Camera className="w-3 h-3 inline mr-1" />
            Live Preview
          </Tag>
          {perfScore !== null && (
            <Tag variant={perfScore >= 90 ? 'green' : perfScore >= 50 ? 'amber' : 'red'}>
              Perf: {perfScore}/100
            </Tag>
          )}
          <a
            href={`https://${domain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-argus-accent-cyan hover:underline flex items-center gap-1 ml-auto"
          >
            Open site <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    );
  }

  return <EmptyState message={data['message'] as string ?? 'Screenshot not available'} />;
}
