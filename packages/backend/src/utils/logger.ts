import winston from 'winston';

const level = process.env['LOG_LEVEL'] ?? 'info';
const isDev = process.env['NODE_ENV'] !== 'production';

export const logger = winston.createLogger({
  level,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    isDev
      ? winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level: lvl, message, ...meta }) => {
            const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
            return `${String(timestamp)} [${lvl}]: ${String(message)}${metaStr}`;
          }),
        )
      : winston.format.json(),
  ),
  transports: [new winston.transports.Console()],
});
