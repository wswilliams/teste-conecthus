import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;

  constructor() {
    this.client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: 1,
      enableReadyCheck: false,
      lazyConnect: true,
    });

    // Prevent ioredis from emitting noisy "Unhandled error event" logs.
    this.client.on('error', (error) => {
      this.logger.warn(`Redis unavailable: ${error.message}`);
    });
  }

  async getJson<T>(key: string): Promise<T | null> {
    try {
      if (this.client.status === 'wait') {
        await this.client.connect();
      }

      const value = await this.client.get(key);
      return value ? (JSON.parse(value) as T) : null;
    } catch {
      return null;
    }
  }

  async setJson<T>(key: string, value: T, ttlSeconds = 300): Promise<void> {
    try {
      if (this.client.status === 'wait') {
        await this.client.connect();
      }

      await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch {
      // Ignore Redis failures to avoid impacting request flow.
    }
  }

  async del(key: string): Promise<void> {
    try {
      if (this.client.status === 'wait') {
        await this.client.connect();
      }

      await this.client.del(key);
    } catch {
      // Ignore Redis failures to avoid impacting request flow.
    }
  }

  async delByPattern(pattern: string): Promise<void> {
    try {
      if (this.client.status === 'wait') {
        await this.client.connect();
      }

      let cursor = '0';

      do {
        const [nextCursor, keys] = await this.client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = nextCursor;

        if (keys.length > 0) {
          await this.client.del(...keys);
        }
      } while (cursor !== '0');
    } catch {
      // Ignore Redis failures to avoid impacting request flow.
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client.status !== 'end') {
      await this.client.quit();
    }
  }
}
