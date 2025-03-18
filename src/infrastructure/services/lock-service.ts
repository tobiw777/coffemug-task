import process from 'node:process';

import { Lock, Redlock } from '@sesamecare-oss/redlock';
import { logger } from '@src/utils/logger';
import Redis from 'ioredis';
import { Container, Service } from 'typedi';

@Service()
export class LockService {
  protected readonly redisClient: Redis;
  protected readonly redlock: Redlock;

  public constructor() {
    try {
      this.redisClient = Container.get('redis');
    } catch {
      const redisClient = new Redis({
        host: process.env.REDIS_HOST,
        port: +process.env.REDIS_PORT!,
      });
      this.redisClient = redisClient;
      Container.set('redis', redisClient);
    }

    this.redlock = new Redlock([this.redisClient], {
      driftFactor: 0.01,
      retryCount: 6,
      retryDelay: 500, // time in ms
      retryJitter: 200, // time in ms
      automaticExtensionThreshold: 500, // time in ms
    });
  }

  public async acquireLock(resources: string[], ttl = 6000): Promise<Lock> {
    try {
      if (ttl <= 0) {
        throw new Error('Ttl must be greater than 0');
      }

      return this.redlock.acquire(resources, ttl);
    } catch (error) {
      logger.warn(`Failed to acquire lock: ${error}`);
      throw error;
    }
  }

  public async releaseLock(lock: Lock): Promise<void> {
    try {
      await this.redlock.release(lock);
    } catch (error) {
      logger.warn(`Failed to release lock: ${error}`);
      throw error;
    }
  }

  public async wrap<T>(callback: () => T | Promise<T>, resources: string[], ttl?: number): Promise<T> {
    const lock = await this.acquireLock(resources, ttl);

    try {
      return await callback();
    } finally {
      await this.releaseLock(lock);
    }
  }
}
