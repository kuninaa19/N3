import mysql from 'mysql';
import path from 'path';
import dotenv from 'dotenv';

const envFound = dotenv.config({
    path: path.join(__dirname, process.env.NODE_ENV === 'production' ? '../conf/.env' : '../conf/.env.development'),
});
if (envFound.error) {
    throw new Error("⚠️  Couldn't find .env file / mysql ⚠️");
}

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});

const getConn = (callback) => {
    pool.getConnection((err, connection) => {
        callback(err, connection);
    });
};

export default getConn;
