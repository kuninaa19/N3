import mysqlLoader from './mysql';
import redisLoader from './redis';
import passportLoader from './passport';
import expressLoader from './express';
import logger from './logger';

export default async (app) => {
    // const mysqlConnection = await mysqlLoader();
    // Logger.info('✌️ DB loaded and connected!');
    await redisLoader(app);
    // logger.info('✌️ redis loaded');
    await passportLoader(app);
    // logger.info('✌️ passport loaded');
    await expressLoader(app);
    // logger.info('✌️ Express loaded');
}