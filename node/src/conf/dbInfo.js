import mysql from 'mysql';
import path from "path";
import dotenv from 'dotenv';

const __dirname = path.resolve();

const envFound = dotenv.config({path: path.join(__dirname, '/src/conf/.env')});
if (envFound.error) {
    // This error should crash whole process

    throw new Error("⚠️  Couldn't find .env file  ⚠️");
}
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

connection.connect(function (error) {
    if(!!error)
    {
        console.log('mysql Error',error);
    }
    else
    {
        // console.log('mysql connected');
    }
});

export default connection;
