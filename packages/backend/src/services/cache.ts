import { logger } from '../utils/logger.js';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private maxSize = 1000;

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.data as T;
  }

  async set<T>(key: string, data: T, ttlSeconds: number): Promise<void> {
    if (this.store.size >= this.maxSize) {
      const firstKey = this.store.keys().next().value;
      if (firstKey !== undefined) this.store.delete(firstKey);
    }
    this.store.set(key, { data, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  async clear(): Promise<void> {
    this.store.clear();
  }
}

class CacheService {
  private memory = new MemoryCache();
  private redis: import('ioredis').default | null = null;
  private initialized = false;

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
    const redisUrl = process.env['REDIS_URL'];
    if (!redisUrl) {
      logger.info('📦 Cache: using in-memory LRU (no REDIS_URL configured)');
      return;
    }
    try {
      const { default: Redis } = await import('ioredis');
      this.redis = new Redis(redisUrl);
      this.redis.on('error', (err: Error) => {
        logger.error('Redis error, falling back to memory cache:', err.message);
        this.redis?.disconnect();
        this.redis = null;
      });
      await this.redis.ping();
      logger.info('📦 Cache: connected to Redis');
    } catch {
      logger.warn('📦 Cache: Redis unavailable, using in-memory LRU');
      this.redis = null;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    await this.ensureInitialized();
    if (!this.redis) return this.memory.get<T>(key);
    try {
      const raw = await this.redis.get(`argus:${key}`);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return this.memory.get<T>(key);
    }
  }

  async set<T>(key: string, data: T, ttlSeconds: number): Promise<void> {
    await this.ensureInitialized();
    if (!this.redis) {
      await this.memory.set(key, data, ttlSeconds);
      return;
    }
    try {
      await this.redis.setex(`argus:${key}`, ttlSeconds, JSON.stringify(data));
    } catch {
      await this.memory.set(key, data, ttlSeconds);
    }
  }

  async clear(): Promise<void> {
    if (this.redis) {
      const keys = await this.redis.keys('argus:*');
      if (keys.length > 0) await this.redis.del(...keys);
    }
    await this.memory.clear();
  }
}

export const cache = new CacheService();
