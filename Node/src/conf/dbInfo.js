import mysql from 'mysql';
import path from "path";
import dotenv from 'dotenv';

dotenv.config({path: path.join(__dirname, '../env/DB.env')});

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASS,
    database : process.env.DB_NAME
});

connection.connect(function(error){
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
