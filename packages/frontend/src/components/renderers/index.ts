import type { ComponentType } from 'react';
import type { CheckResult } from '@argus/shared';

// Lazy-loaded renderers for each check type
import { SecurityScoreRenderer } from './SecurityScoreRenderer';
import { SslChainRenderer } from './SslChainRenderer';
import { TlsCiphersRenderer } from './TlsCiphersRenderer';
import { SecurityHeadersRenderer } from './SecurityHeadersRenderer';
import { HstsPreloadRenderer } from './HstsPreloadRenderer';
import { CookiesRenderer } from './CookiesRenderer';
import { WafRenderer } from './WafRenderer';
import { SafeBrowsingRenderer } from './SafeBrowsingRenderer';
import { VirusTotalRenderer } from './VirusTotalRenderer';
import { IpInfoRenderer } from './IpInfoRenderer';
import { ServerInfoRenderer } from './ServerInfoRenderer';
import { DnsRecordsRenderer } from './DnsRecordsRenderer';
import { DnssecRenderer } from './DnssecRenderer';
import { HttpHeadersRenderer } from './HttpHeadersRenderer';
import { HttpVersionRenderer } from './HttpVersionRenderer';
import { RedirectChainRenderer } from './RedirectChainRenderer';
import { OpenPortsRenderer } from './OpenPortsRenderer';
import { TracerouteRenderer } from './TracerouteRenderer';
import { WhoisRenderer } from './WhoisRenderer';
import { SubdomainsRenderer } from './SubdomainsRenderer';
import { RelatedDomainsRenderer } from './RelatedDomainsRenderer';
import { EmailSecurityRenderer } from './EmailSecurityRenderer';
import { ContentAnalysisRenderer } from './ContentAnalysisRenderer';
import { TechStackRenderer } from './TechStackRenderer';
import { RobotsRenderer } from './RobotsRenderer';
import { SitemapRenderer } from './SitemapRenderer';
import { LinkAnalysisRenderer } from './LinkAnalysisRenderer';
import { SocialMediaRenderer } from './SocialMediaRenderer';
import { ScreenshotRenderer } from './ScreenshotRenderer';
import { PerformanceRenderer } from './PerformanceRenderer';
import { QualityScoreRenderer } from './QualityScoreRenderer';
import { CarbonFootprintRenderer } from './CarbonFootprintRenderer';
import { GlobalRankingRenderer } from './GlobalRankingRenderer';
import { ArchiveHistoryRenderer } from './ArchiveHistoryRenderer';

// ── Phase 7 Renderers (New 8) ──
import { CertTransparencyRenderer } from './CertTransparencyRenderer';
import { HiddenPathsRenderer } from './HiddenPathsRenderer';
import { TrackersRenderer } from './TrackersRenderer';
import { CdnDetectionRenderer } from './CdnDetectionRenderer';
import { DnsPropagationRenderer } from './DnsPropagationRenderer';
import { BreachCheckRenderer } from './BreachCheckRenderer';
import { AccessibilityRenderer } from './AccessibilityRenderer';
import { Ipv6SupportRenderer } from './Ipv6SupportRenderer';

export interface RendererProps {
  data: Record<string, unknown>;
  result: CheckResult;
}

const renderers: Record<string, ComponentType<RendererProps>> = {
  'security-score': SecurityScoreRenderer,
  'ssl-chain': SslChainRenderer,
  'tls-ciphers': TlsCiphersRenderer,
  'security-headers': SecurityHeadersRenderer,
  'hsts-preload': HstsPreloadRenderer,
  'cookies': CookiesRenderer,
  'waf-detection': WafRenderer,
  'safe-browsing': SafeBrowsingRenderer,
  'virustotal': VirusTotalRenderer,
  'ip-info': IpInfoRenderer,
  'server-info': ServerInfoRenderer,
  'dns-records': DnsRecordsRenderer,
  'dnssec': DnssecRenderer,
  'http-headers': HttpHeadersRenderer,
  'http-version': HttpVersionRenderer,
  'redirect-chain': RedirectChainRenderer,
  'open-ports': OpenPortsRenderer,
  'traceroute': TracerouteRenderer,
  'whois': WhoisRenderer,
  'subdomains': SubdomainsRenderer,
  'related-domains': RelatedDomainsRenderer,
  'email-config': EmailSecurityRenderer,
  'content-analysis': ContentAnalysisRenderer,
  'tech-stack': TechStackRenderer,
  'robots-txt': RobotsRenderer,
  'sitemap': SitemapRenderer,
  'link-analysis': LinkAnalysisRenderer,
  'social-media': SocialMediaRenderer,
  'screenshot': ScreenshotRenderer,
  'performance': PerformanceRenderer,
  'quality-score': QualityScoreRenderer,
  'carbon-footprint': CarbonFootprintRenderer,
  'global-ranking': GlobalRankingRenderer,
  'archive-history': ArchiveHistoryRenderer,

  // ── Phase 7 ──
  'cert-transparency': CertTransparencyRenderer,
  'hidden-paths': HiddenPathsRenderer,
  'trackers': TrackersRenderer,
  'cdn-detection': CdnDetectionRenderer,
  'dns-propagation': DnsPropagationRenderer,
  'breach-check': BreachCheckRenderer,
  'accessibility': AccessibilityRenderer,
  'ipv6-support': Ipv6SupportRenderer,
};

export function getRenderer(checkId: string): ComponentType<RendererProps> | null {
  return renderers[checkId] ?? null;
}
