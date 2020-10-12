import redis from 'redis';
import path from 'path';
import dotenv from 'dotenv';

const __dirname = path.resolve();

dotenv.config({path: path.join(__dirname, '/src/conf/redis.env')});

const redisClient = redis.createClient({
    host: process.env.REDIS_HOST,
    port: 6379
});

const redisSecret = process.env.SESSION_KEY;

export {redisClient, redisSecret};