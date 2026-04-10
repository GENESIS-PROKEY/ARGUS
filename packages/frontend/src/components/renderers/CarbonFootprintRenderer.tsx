import type { RendererProps } from './index';
import { GradeBadge, KV, Tag } from './Shared';

export function CarbonFootprintRenderer({ data }: RendererProps) {
  const grade = data['grade'] as string ?? 'F';
  const pageSize = data['pageSize'] as string ?? '';
  const co2 = data['co2PerVisit'] as string ?? '';
  const annual = data['annualEstimate'] as string ?? '';
  const comparison = data['comparison'] as Record<string, unknown> ?? {};

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="text-center">
          <span className="text-3xl">🌿</span>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GradeBadge grade={grade} />
          </div>
          <p className="text-xs text-argus-text-muted">{co2} CO₂ per visit</p>
        </div>
      </div>
      <KV label="Page Size" value={pageSize} />
      <KV label="Annual Estimate" value={annual} />
      <Tag variant={comparison['isCleanerThanMedian'] ? 'green' : 'amber'}>
        {comparison['percentDifference'] as string}
      </Tag>
    </div>
  );
}
