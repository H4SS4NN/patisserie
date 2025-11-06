import { createClient } from 'redis';
import { config } from 'dotenv';

config();

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

let isConnected = false;

export const connectRedis = async (): Promise<void> => {
  if (!isConnected) {
    await redisClient.connect();
    isConnected = true;
    console.log('Redis connected');
  }
};

export const getRedisClient = () => {
  if (!isConnected) {
    throw new Error('Redis not connected. Call connectRedis() first.');
  }
  return redisClient;
};

export { redisClient };

