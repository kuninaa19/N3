import redis from 'redis';
import path from 'path';
import dotenv from 'dotenv';

const __dirname = path.resolve();

const envFound = dotenv.config({path: path.join(__dirname, '/src/conf/.env')});
if (envFound.error) {
    // This error should crash whole process

    throw new Error("⚠️  Couldn't find .env file  ⚠️");
}
const redisClient = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
});

const redisSecret = process.env.SESSION_KEY;

export {redisClient, redisSecret};