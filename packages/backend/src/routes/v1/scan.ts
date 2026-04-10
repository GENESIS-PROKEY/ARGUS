import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { parseTarget } from '../../utils/parseTarget.js';
import { runChecks } from '../../services/checkRunner.js';
import { logger } from '../../utils/logger.js';
import type { ScanEvent } from '@argus/shared';

const scanRouter = Router();

const scanQuerySchema = z.object({
  url: z.string().min(1, 'URL is required'),
});

scanRouter.get('/scan', (req: Request, res: Response): void => {
  const validation = scanQuerySchema.safeParse(req.query);
  if (!validation.success) {
    res.status(400).json({ error: validation.error.errors[0]?.message ?? 'Invalid input' });
    return;
  }

  const { url } = validation.data;
  const scanId = uuidv4();

  const targetResult = parseTarget(url);
  if (!targetResult.success) {
    res.status(400).json({ error: targetResult.error });
    return;
  }

  const target = targetResult.data;
  logger.info(`Starting scan ${scanId} for ${target.hostname}`);

  // SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  let isConnected = true;
  req.on('close', () => {
    isConnected = false;
    logger.debug(`Client disconnected from scan ${scanId}`);
  });

  const sendEvent = (event: ScanEvent) => {
    if (isConnected) {
      res.write(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`);
    }
  };

  runChecks(target, scanId, sendEvent)
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unknown error';
      sendEvent({ type: 'scan:error', scanId, error: message, timestamp: Date.now() });
    })
    .finally(() => {
      if (isConnected) res.end();
    });
});

export { scanRouter };
