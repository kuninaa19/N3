const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
// const FileStore = require('session-file-store')(session);
// const mongoose = require('mongoose');

const server = app.listen(3000, function(){
  console.log("3000서버 가동");
});

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use('/public', express.static(__dirname + '/public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true  }));

// app.use(session({
//     secret: '%^#*SIGN@*$#',
//     resave: false,
//     saveUninitialized: true,
//     store: new FileStore(),
//     //세션 2시간허용
//     cookie: { originalMaxAge: 7.2e+6, httpOnly: true }
// }));

const indexRouter = require('./routes/index')(app);
