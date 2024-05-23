import IORedis from 'ioredis';
import env from '../config/env';
import { Service } from 'typedi';

@Service()
export class RedisService {
  private readonly _client: IORedis;

  constructor() {
    this._client = new IORedis(env.REDIS_URL);

    this._client.on('ready', () => {
      console.log('Redis init');
    });

    this._client.on('error', (err) => {
      console.error(`Redis error: ${err}`);
    });
  }

  get client(): IORedis {
    return this._client;
  }
}
