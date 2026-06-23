// src/redis/redis.service.ts
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
    private redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
    });

    async get(key: string) {
        return this.redis.get(key);
    }

    async set(key: string, value: any, ttl = 300) {
        return this.redis.set(key, JSON.stringify(value), 'EX', ttl);
    }

    async del(key: string) {
        return this.redis.del(key);
    }

    async delPattern(pattern: string) {
        const keys = await this.redis.keys(pattern);
        if (keys.length) {
            await this.redis.del(...keys);
        }
    }

    async onModuleDestroy() {
        await this.redis.quit();
    }
}