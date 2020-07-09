import path from 'path';
import redis from 'redis';

import dotenv from 'dotenv';
dotenv.config({path: path.join(__dirname, './env/redis.env')});

const redisClient = redis.createClient({
    host: process.env.REDIS_HOST,
    port: 6379
});

export default redisClient;