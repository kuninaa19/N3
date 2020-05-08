import express from 'express';
import logger from 'morgan';
import path from 'path';
import session from 'express-session';
import methodOverride from 'method-override'; // put, delete 메소드 지원하기위해서

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

//log
if (!module.parent) app.use(logger('dev'));

// serve static files
app.use('/static', express.static(path.join(__dirname, 'public')));

// session support
app.use(session({
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    secret: 'some secret here'
}));

// parse request bodies (req.body) body-parser 대안
app.use(express.urlencoded({extended: true}));

// allow overriding methods in query (?_method=put)
app.use(methodOverride('_method'));

app.listen(3000, () => console.log('port 3000 Server On'));

// import {router as indexRouter} from './routes/index';
import indexRouter from './routes/index';
import userRouter from './routes/users';

app.use('/', indexRouter);
app.use('/user', userRouter);

