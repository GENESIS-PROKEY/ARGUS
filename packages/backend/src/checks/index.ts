import type { ParsedTarget, CheckResult, CheckCategory } from '@argus/shared';

export interface CheckModule {
  id: string;
  name: string;
  description: string;
  category: CheckCategory;
  icon: string;
  run: (target: ParsedTarget) => Promise<CheckResult>;
}

// ── Phase 2 Checks (Core 12) ──
import { ipInfoCheck } from './ip-info.js';
import { sslChainCheck } from './ssl-chain.js';
import { dnsRecordsCheck } from './dns-records.js';
import { httpHeadersCheck } from './http-headers.js';
import { cookiesCheck } from './cookies.js';
import { whoisCheck } from './whois.js';
import { robotsTxtCheck } from './robots-txt.js';
import { sitemapCheck } from './sitemap.js';
import { redirectChainCheck } from './redirect-chain.js';
import { serverInfoCheck } from './server-info.js';
import { securityHeadersCheck } from './security-headers.js';
import { techStackCheck } from './tech-stack.js';

// ── Phase 3 Checks (Remaining 22) ──
import { openPortsCheck } from './open-ports.js';
import { tracerouteCheck } from './traceroute.js';
import { wafDetectionCheck } from './waf-detection.js';
import { dnssecCheck } from './dnssec.js';
import { httpVersionCheck } from './http-version.js';
import { tlsCiphersCheck } from './tls-ciphers.js';
import { subdomainCheck } from './subdomains.js';
import { emailConfigCheck } from './email-config.js';
import { contentAnalysisCheck } from './content-analysis.js';
import { performanceCheck } from './performance.js';
import { archiveHistoryCheck } from './archive-history.js';
import { socialMediaCheck } from './social-media.js';
import { globalRankingCheck } from './global-ranking.js';
import { carbonFootprintCheck } from './carbon-footprint.js';
import { virusTotalCheck } from './virustotal.js';
import { safeBrowsingCheck } from './safe-browsing.js';
import { linkAnalysisCheck } from './link-analysis.js';
import { qualityScoreCheck } from './quality-score.js';
import { hstsPreloadCheck } from './hsts-preload.js';
import { relatedDomainsCheck } from './related-domains.js';
import { screenshotCheck } from './screenshot.js';
import { securityScoreCheck } from './security-score.js';

// ── Phase 7 Checks (New 8) ──
import { certTransparencyCheck } from './cert-transparency.js';
import { hiddenPathsCheck } from './hidden-paths.js';
import { trackersCheck } from './trackers.js';
import { cdnDetectionCheck } from './cdn-detection.js';
import { dnsPropagationCheck } from './dns-propagation.js';
import { breachCheckCheck } from './breach-check.js';
import { accessibilityCheck } from './accessibility.js';
import { ipv6SupportCheck } from './ipv6-support.js';

// ── Check registry — order determines execution and display order ──
export const checks: CheckModule[] = [
  // Security & Threats (most important first)
  securityScoreCheck,
  sslChainCheck,
  tlsCiphersCheck,
  securityHeadersCheck,
  hstsPreloadCheck,
  cookiesCheck,
  wafDetectionCheck,
  safeBrowsingCheck,
  virusTotalCheck,
  hiddenPathsCheck,          // NEW
  breachCheckCheck,          // NEW
  certTransparencyCheck,     // NEW

  // Network & Infrastructure
  ipInfoCheck,
  serverInfoCheck,
  dnsRecordsCheck,
  dnssecCheck,
  dnsPropagationCheck,       // NEW
  ipv6SupportCheck,          // NEW
  httpHeadersCheck,
  httpVersionCheck,
  redirectChainCheck,
  openPortsCheck,
  tracerouteCheck,
  cdnDetectionCheck,         // NEW

  // DNS & Discovery
  whoisCheck,
  subdomainCheck,
  relatedDomainsCheck,
  emailConfigCheck,

  // Content & SEO
  contentAnalysisCheck,
  techStackCheck,
  robotsTxtCheck,
  sitemapCheck,
  linkAnalysisCheck,
  socialMediaCheck,
  screenshotCheck,
  trackersCheck,             // NEW

  // Performance & Quality
  performanceCheck,
  qualityScoreCheck,
  accessibilityCheck,        // NEW
  carbonFootprintCheck,

  // Reputation & History
  globalRankingCheck,
  archiveHistoryCheck,
];
