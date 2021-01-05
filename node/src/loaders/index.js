import mysqlLoader from './mysql';
import redisLoader from './redis';
import passportLoader from './passport';
import expressLoader from './express';

export default async (app) => {
    // const mysqlConnection = await mysqlLoader();
    await redisLoader(app);
    await passportLoader(app);
    await expressLoader(app);
}