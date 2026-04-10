import express from 'express';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import { config } from './config/index.js';
import { setupMiddleware } from './middleware/index.js';
import { v1Router } from './routes/v1/index.js';
import { logger } from './utils/logger.js';

const app = express();

setupMiddleware(app);

app.use('/api/v1', v1Router);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: Date.now(),
    version: '1.0.0',
    name: 'argus',
    checks: 42,
    uptime: Math.floor(process.uptime()),
  });
});

// In production, serve the frontend's built static files
if (config.NODE_ENV === 'production') {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const frontendDist = resolve(__dirname, '../../frontend/dist');

  if (existsSync(frontendDist)) {
    app.use(express.static(frontendDist));
    // SPA fallback — send index.html for all non-API routes
    app.get('*', (_req, res) => {
      res.sendFile(resolve(frontendDist, 'index.html'));
    });
    logger.info(`📦 Serving frontend from ${frontendDist}`);
  } else {
    logger.warn('Frontend build not found — run `npm run build` in packages/frontend first');
  }
}

const server = app.listen(config.PORT, () => {
  logger.info(`🔱 ARGUS API running on port ${config.PORT}`);
  logger.info(`📡 Environment: ${config.NODE_ENV}`);
  logger.info(`🌐 CORS origin: ${config.CORS_ORIGIN}`);
});

const shutdown = () => {
  logger.info('Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export default app;
