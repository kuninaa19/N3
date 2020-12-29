import mysql from 'mysql';
import path from 'path';
import dotenv from 'dotenv';
import logger from './logger';

const envFound = dotenv.config({
    path: path.join(__dirname,
        process.env.NODE_ENV === 'production' ? '../conf/.env' : '../conf/.env.development')
});
if (envFound.error) {
    throw new Error("⚠️  Couldn't find .env file / mysql ⚠️");
}

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

connection.connect(function (error) {
    if (error) {
        console.log('mysql Error', error);
        logger.error(error);
    } else {
        logger.info('mysql connected');
    }
});

export default connection;