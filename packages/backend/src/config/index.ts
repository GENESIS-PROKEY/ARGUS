import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

// Load .env from monorepo root BEFORE parsing config
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../../../../.env');
dotenv.config({ path: envPath });
dotenv.config(); // fallback to local .env

const configSchema = z.object({
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  CHECK_TIMEOUT_MS: z.coerce.number().default(15000),
  CACHE_TTL_SECONDS: z.coerce.number().default(300),
  REDIS_URL: z.string().optional(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  GOOGLE_SAFE_BROWSING_KEY: z.string().optional(),
  CLOUDMERSIVE_API_KEY: z.string().optional(),
  VIRUSTOTAL_API_KEY: z.string().optional(),
});

const parsed = configSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment configuration:');
  console.error(JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export const config = Object.freeze(parsed.data);
export type Config = z.infer<typeof configSchema>;
