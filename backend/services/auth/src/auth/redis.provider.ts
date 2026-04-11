import { Provider } from '@nestjs/common';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

export const RedisProvider: Provider = {
  provide: REDIS_CLIENT,
  useFactory: (): Redis => {
    const redisUrl = process.env['REDIS_URL'];
    if (!redisUrl) throw new Error('REDIS_URL is not set');
    return new Redis(redisUrl, { lazyConnect: false });
  },
};
