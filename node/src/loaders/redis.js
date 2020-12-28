import redis from 'redis';
import path from 'path';
import dotenv from 'dotenv';
import connectRedis from 'connect-redis';
import session from 'express-session';

const envFound = dotenv.config({
    path: path.join(__dirname,
        process.env.NODE_ENV === 'production' ? '../conf/.env' : '../conf/.env.development')
});
if (envFound.error) {
    throw new Error("⚠️  Couldn't find .env file / redis  ⚠️");
}

export default async (app) => {
    const redisClient = redis.createClient({
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    });

    const redisSecret = process.env.SESSION_KEY;
    const redisStore = connectRedis(session);

    app.use(session({
        store: new redisStore({
            client: redisClient,
            prefix: "session:",
            db: 0
        }),
        saveUninitialized: false,
        resave: false,
        secret: redisSecret,
        cookie: {maxAge: 5.256e+9, Secure: true, httpOnly: true} //2달
    }));
};