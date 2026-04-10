import type { RendererProps } from './index';
import { Tag, EmptyState } from './Shared';
import { getSocialIcon, getAllPlatforms } from '@/lib/socialIcons';

export function SocialMediaRenderer({ data }: RendererProps) {
  const profiles = data['profiles'] as Array<{ platform: string; handle: string; url: string }> ?? [];
  const totalFound = data['totalFound'] as number ?? 0;
  const platformCount = data['platformCount'] as number ?? 0;

  if (totalFound === 0) return <EmptyState message="No social media links detected on the page" />;

  // Detected platform names for dimming undetected ones
  const detectedPlatforms = new Set(profiles.map(p => p.platform));
  const allPlatforms = getAllPlatforms();
  const undetected = allPlatforms.filter(p => !detectedPlatforms.has(p));

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Tag variant="cyan">{totalFound} profile{totalFound !== 1 ? 's' : ''}</Tag>
        <Tag variant="neutral">{platformCount} platform{platformCount !== 1 ? 's' : ''}</Tag>
      </div>

      {/* Detected profiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {profiles.slice(0, 15).map((p, i) => {
          const icon = getSocialIcon(p.platform);
          return (
            <a key={i} href={p.url} target="_blank" rel="noopener"
              className="flex items-center gap-3 p-2.5 rounded-lg border border-argus-card-border/30 hover:border-argus-accent-cyan/30 transition-all hover:bg-argus-card-border/10 group"
            >
              {/* Brand icon */}
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                style={{ backgroundColor: icon ? `#${icon.hex}18` : 'rgba(255,255,255,0.05)' }}>
                {icon ? (
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill={`#${icon.hex}`}>
                    <path d={icon.path} />
                  </svg>
                ) : (
                  <span className="text-sm">🔗</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-argus-text-primary font-medium truncate group-hover:text-argus-accent-cyan transition-colors">
                  @{p.handle}
                </p>
                <p className="text-[10px] text-argus-text-muted">{p.platform}</p>
              </div>
            </a>
          );
        })}
      </div>

      {/* Undetected platforms (dimmed) */}
      {undetected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-argus-card-border/20">
          {undetected.slice(0, 8).map((platform) => {
            const icon = getSocialIcon(platform);
            return (
              <div key={platform} className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-argus-card-border/5 opacity-30">
                {icon ? (
                  <svg viewBox="0 0 24 24" className="w-3 h-3" fill={`#${icon.hex}`}>
                    <path d={icon.path} />
                  </svg>
                ) : null}
                <span className="text-[10px] text-argus-text-muted">{platform}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
