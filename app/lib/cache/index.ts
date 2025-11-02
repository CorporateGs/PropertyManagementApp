// Caching abstraction layer
export interface CacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(pattern?: string): Promise<void>;
  has(key: string): Promise<boolean>;
  size(): Promise<number>;
}

// In-memory cache implementation
export class MemoryCache implements CacheService {
  private cache = new Map<string, { value: any; expiry: number }>();

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value as T;
  }

  async set<T>(key: string, value: T, ttl: number = 3600): Promise<void> {
    const expiry = Date.now() + (ttl * 1000);
    this.cache.set(key, { value, expiry });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(pattern?: string): Promise<void> {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    // Simple pattern matching (key contains pattern)
    for (const [key] of this.cache) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  async has(key: string): Promise<boolean> {
    const item = this.cache.get(key);
    if (!item) return false;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  async size(): Promise<number> {
    // Clean expired items before returning size
    const now = Date.now();
    for (const [key, item] of this.cache) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }

    return this.cache.size;
  }
}

// Redis cache implementation
export class RedisCache implements CacheService {
  private redis: any;

  constructor(redisUrl: string = 'redis://localhost:6379') {
    // TODO: Initialize Redis client
    // const Redis = await import('ioredis');
    // this.redis = new Redis(redisUrl);
  }

  async get<T>(key: string): Promise<T | null> {
    // TODO: Implement Redis get
    throw new Error('Redis cache not implemented');
  }

  async set<T>(key: string, value: T, ttl: number = 3600): Promise<void> {
    // TODO: Implement Redis set with TTL
    throw new Error('Redis cache not implemented');
  }

  async delete(key: string): Promise<void> {
    // TODO: Implement Redis delete
    throw new Error('Redis cache not implemented');
  }

  async clear(pattern?: string): Promise<void> {
    // TODO: Implement Redis clear with pattern
    throw new Error('Redis cache not implemented');
  }

  async has(key: string): Promise<boolean> {
    // TODO: Implement Redis exists
    throw new Error('Redis cache not implemented');
  }

  async size(): Promise<number> {
    // TODO: Implement Redis dbsize
    throw new Error('Redis cache not implemented');
  }
}

// Cache factory
export function createCache(type: 'memory' | 'redis' = 'memory'): CacheService {
  switch (type) {
    case 'redis':
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      return new RedisCache(redisUrl);

    case 'memory':
    default:
      return new MemoryCache();
  }
}

// Cache key generators
export const cacheKeys = {
  tenants: (filters?: string) => `tenants:${filters || 'all'}`,
  units: (filters?: string) => `units:${filters || 'all'}`,
  payments: (filters?: string) => `payments:${filters || 'all'}`,
  maintenance: (filters?: string) => `maintenance:${filters || 'all'}`,
  buildings: (filters?: string) => `buildings:${filters || 'all'}`,
  dashboard: (userId: string, filters?: string) => `dashboard:${userId}:${filters || 'all'}`,
  aiResponse: (hash: string) => `ai:response:${hash}`,
  user: (userId: string) => `user:${userId}`,
  session: (sessionId: string) => `session:${sessionId}`,
};

// Cache TTL values (in seconds)
export const cacheTTL = {
  short: 300,      // 5 minutes
  medium: 1800,    // 30 minutes
  long: 3600,      // 1 hour
  extended: 86400, // 24 hours
};

// Cache decorators
export function cacheable<T extends (...args: any[]) => Promise<any>>(
  keyFn: (...args: Parameters<T>) => string,
  ttl: number = cacheTTL.medium
) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: Parameters<T>) {
      const cache = createCache();
      const key = keyFn(...args);

      // Try to get from cache first
      const cached = await cache.get(key);
      if (cached !== null) {
        return cached;
      }

      // Execute method and cache result
      const result = await method.apply(this, args);
      await cache.set(key, result, ttl);

      return result;
    };
  };
}

// Cache invalidation helpers
export class CacheManager {
  private cache = createCache();

  async invalidate(pattern: string): Promise<void> {
    await this.cache.clear(pattern);
  }

  async invalidateTenant(tenantId: string): Promise<void> {
    await Promise.all([
      this.cache.clear(`tenants:`),
      this.cache.clear(`payments:tenant:${tenantId}`),
      this.cache.clear(`maintenance:tenant:${tenantId}`),
    ]);
  }

  async invalidateUnit(unitId: string): Promise<void> {
    await Promise.all([
      this.cache.clear(`units:`),
      this.cache.clear(`tenants:unit:${unitId}`),
      this.cache.clear(`payments:unit:${unitId}`),
      this.cache.clear(`maintenance:unit:${unitId}`),
    ]);
  }

  async invalidateBuilding(buildingId: string): Promise<void> {
    await Promise.all([
      this.cache.clear(`buildings:`),
      this.cache.clear(`units:building:${buildingId}`),
      this.cache.clear(`tenants:building:${buildingId}`),
      this.cache.clear(`dashboard:building:${buildingId}`),
    ]);
  }

  async invalidateUser(userId: string): Promise<void> {
    await Promise.all([
      this.cache.clear(`dashboard:${userId}`),
      this.cache.clear(`user:${userId}`),
    ]);
  }

  async clearAll(): Promise<void> {
    await this.cache.clear();
  }

  async getStats(): Promise<{ size: number; hitRate?: number }> {
    return {
      size: await this.cache.size(),
    };
  }
}

// Default cache instance
export const cache = createCache(
  (process.env.CACHE_TYPE as 'memory' | 'redis') || 'memory'
);

// Default cache manager instance
export const cacheManager = new CacheManager();