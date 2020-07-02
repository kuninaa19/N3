"use strict";

import path from "path";
import socketio from 'socket.io';
const express = require('express');
const app = express();
const session = require('express-session');
const flash = require('connect-flash');
const FileStore = require('session-file-store')(session);

import socket from './socket_io';
import https from "https";
import fs from "fs";
import config from "./conf/config";
app.use('/static', express.static(path.join(__dirname, 'public')));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    store: new FileStore()
}));

app.get('/', (req, res) => {

    res.render('example.ejs');
});

// const server= app.listen(3001, () => console.log('port 3000 Server On'));

const server = https.createServer({
    key: fs.readFileSync(config.ssl.key,"utf-8"),
    cert: fs.readFileSync(config.ssl.crt,"utf-8"),
    // ca : fs.readFileSync(config.ssl.ca,"utf-8")
},app);
server.listen(3001, () => console.log('port 3001 On'));

const io = socket(server);


