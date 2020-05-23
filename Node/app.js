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
app.use('/', indexRouter);

// 인증 라우터
import authRouter from "./routes/auth";
app.use('/auth', authRouter);

//방 검색 라우터
import searchRouter from "./routes/room/search";
app.use('/search', searchRouter);

// 방 세부페이지,확인 및 결제 라우터
import detailRouter from "./routes/room/detail";
app.use('/rooms', detailRouter);

// 메시지 라우터
import messageRouter from "./routes/user/message";
app.use('/message', messageRouter);

// 예약한 방에 대한 라우터
import reservationRouter from "./routes/user/trip";
app.use('/trip', reservationRouter);