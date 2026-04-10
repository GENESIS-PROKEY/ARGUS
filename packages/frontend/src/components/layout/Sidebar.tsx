import { useState } from 'react';
import { useScanStore } from '@/stores/scanStore';
import { StatusDot } from '@/components/ui/StatusDot';
import { ChevronDown, ChevronRight, Shield, Globe, Server, FileText, Gauge, Mail } from 'lucide-react';
import type { CheckStatus } from '@argus/shared';

/* ─── Category definitions with display order ─── */
interface CategoryGroup {
  id: string;
  label: string;
  icon: typeof Shield;
  color: string;
  checkIds: string[];
}

const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    id: 'security',
    label: 'Security',
    icon: Shield,
    color: 'text-rose-400',
    checkIds: [
      'security-score', 'ssl-chain', 'tls-ciphers', 'security-headers',
      'hsts-preload', 'cookies', 'waf-detection', 'safe-browsing',
      'virustotal', 'hidden-paths', 'breach-check', 'cert-transparency',
    ],
  },
  {
    id: 'network',
    label: 'DNS & Network',
    icon: Globe,
    color: 'text-amber-400',
    checkIds: [
      'ip-info', 'dns-records', 'dnssec', 'dns-propagation',
      'http-headers', 'http-version', 'redirect-chain',
      'open-ports', 'traceroute', 'whois', 'subdomains',
    ],
  },
  {
    id: 'infrastructure',
    label: 'Infrastructure',
    icon: Server,
    color: 'text-cyan-400',
    checkIds: [
      'server-info', 'ipv6-support', 'cdn-detection',
      'related-domains', 'email-config',
    ],
  },
  {
    id: 'content',
    label: 'Content',
    icon: FileText,
    color: 'text-emerald-400',
    checkIds: [
      'content-analysis', 'tech-stack', 'robots-txt', 'sitemap',
      'link-analysis', 'social-media', 'screenshot', 'trackers',
    ],
  },
  {
    id: 'performance',
    label: 'Performance',
    icon: Gauge,
    color: 'text-violet-400',
    checkIds: [
      'performance', 'quality-score', 'accessibility', 'carbon-footprint',
    ],
  },
  {
    id: 'reputation',
    label: 'Reputation',
    icon: Mail,
    color: 'text-sky-400',
    checkIds: [
      'global-ranking', 'archive-history',
    ],
  },
];

function getGroupForCheck(checkId: string): string {
  for (const group of CATEGORY_GROUPS) {
    if (group.checkIds.includes(checkId)) return group.id;
  }
  return 'content'; // fallback
}

export function Sidebar() {
  const { checks, status } = useScanStore();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const checkList = Array.from(checks.values());
  const checkMap = new Map(checkList.map(c => [c.id, c]));

  const toggleGroup = (id: string) => {
    setCollapsed(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <aside className="w-72 border-r border-argus-card-border bg-argus-bg-deep overflow-y-auto hidden lg:block">
      <div className="p-4">
        <h2 className="text-xs uppercase tracking-wider text-argus-text-muted font-semibold mb-4">
          Check Results
        </h2>
        {checkList.length === 0 && status !== 'idle' && (
          <div className="flex items-center gap-2 text-sm text-argus-text-muted">
            <div className="w-3 h-3 border-2 border-argus-accent-cyan/30 border-t-argus-accent-cyan rounded-full animate-spin" />
            Initializing checks...
          </div>
        )}

        <nav className="space-y-2">
          {CATEGORY_GROUPS.map((group) => {
            const groupChecks = group.checkIds
              .map(id => checkMap.get(id))
              .filter((c): c is CheckStatus => c !== undefined);

            if (groupChecks.length === 0 && status !== 'scanning') return null;

            const completed = groupChecks.filter(c => c.status === 'success' || c.status === 'error').length;
            const total = groupChecks.length;
            const isCollapsed = collapsed[group.id] ?? false;
            const Icon = group.icon;

            return (
              <div key={group.id}>
                {/* Group header */}
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-argus-card-border/10 transition-colors"
                >
                  {isCollapsed
                    ? <ChevronRight className="w-3 h-3 text-argus-text-muted" />
                    : <ChevronDown className="w-3 h-3 text-argus-text-muted" />
                  }
                  <Icon className={`w-3.5 h-3.5 ${group.color}`} />
                  <span className="text-xs font-semibold text-argus-text-secondary flex-1 text-left">
                    {group.label}
                  </span>
                  <span className="text-[10px] text-argus-text-muted">
                    {completed}/{total}
                  </span>
                </button>

                {/* Group checks */}
                {!isCollapsed && (
                  <div className="ml-4 border-l border-argus-card-border/20 pl-2 mt-1 space-y-0.5">
                    {groupChecks.map((check) => (
                      <a
                        key={check.id}
                        href={`#check-${check.id}`}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors hover:bg-argus-card group"
                      >
                        <StatusDot status={check.status} />
                        <span className="truncate text-xs text-argus-text-secondary group-hover:text-argus-text-primary transition-colors">
                          {check.name}
                        </span>
                        {check.result?.duration !== undefined && (
                          <span className="ml-auto text-[10px] text-argus-text-muted flex-shrink-0">
                            {check.result.duration}ms
                          </span>
                        )}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
