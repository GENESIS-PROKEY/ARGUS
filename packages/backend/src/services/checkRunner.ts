import type { ParsedTarget, CheckResult, ScanEvent } from '@argus/shared';
import { checks } from '../checks/index.js';
import { withTimeout } from '../utils/timeout.js';
import { config } from '../config/index.js';
import { cache } from './cache.js';
import { logger } from '../utils/logger.js';

export async function runChecks(
  target: ParsedTarget,
  scanId: string,
  onEvent: (event: ScanEvent) => void,
): Promise<void> {
  const startTime = Date.now();
  const totalChecks = checks.length;
  let completedCount = 0;
  let failedCount = 0;

  onEvent({
    type: 'scan:start',
    scanId,
    target,
    totalChecks,
    timestamp: Date.now(),
  });

  const checkPromises = checks.map(async (check) => {
    onEvent({
      type: 'check:start',
      scanId,
      checkId: check.id,
      checkName: check.name,
      timestamp: Date.now(),
    });

    const cacheKey = `${check.id}:${target.hostname}`;
    const cached = await cache.get<CheckResult>(cacheKey);
    if (cached) {
      completedCount++;
      onEvent({
        type: 'check:complete',
        scanId,
        checkId: check.id,
        checkName: check.name,
        result: { ...cached, cached: true },
        completedCount,
        totalChecks,
        timestamp: Date.now(),
      });
      return;
    }

    let result: CheckResult;
    const checkStart = Date.now();
    try {
      result = await withTimeout(
        check.run(target),
        config.CHECK_TIMEOUT_MS,
        `Check "${check.name}" timed out after ${config.CHECK_TIMEOUT_MS}ms`,
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      result = { success: false, error: message, duration: Date.now() - checkStart };
    }

    if (result.success) {
      await cache.set(cacheKey, result, config.CACHE_TTL_SECONDS);
    }

    completedCount++;
    if (!result.success) failedCount++;

    onEvent({
      type: 'check:complete',
      scanId,
      checkId: check.id,
      checkName: check.name,
      result,
      completedCount,
      totalChecks,
      timestamp: Date.now(),
    });
  });

  await Promise.allSettled(checkPromises);

  logger.info(
    `Scan ${scanId} complete: ${completedCount - failedCount}/${totalChecks} passed in ${Date.now() - startTime}ms`,
  );

  onEvent({
    type: 'scan:complete',
    scanId,
    totalDuration: Date.now() - startTime,
    completedChecks: completedCount,
    failedChecks: failedCount,
    timestamp: Date.now(),
  });
}
