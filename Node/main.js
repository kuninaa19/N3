"use strict";

import path from "path";
import socketio from 'socket.io';
const express = require('express');
const app = express();
const session = require('express-session');
const flash = require('connect-flash');
const FileStore = require('session-file-store')(session);

import socket from './socket_io';
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

const server = app.listen(3000, () => console.log('Server On'));
const io = socket(server);

