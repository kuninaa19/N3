import express from 'express';
import logger from 'morgan';
import path from 'path';
import methodOverride from 'method-override'; // put, delete 메소드 지원하기위해서
import helmet from 'helmet';
import passport from 'passport';
import initPassport from './conf/passport';
import flash from 'connect-flash';
import socket from "./socket_io";
import redisClient from './redis';
import connectRedis from 'connect-redis';
import session from 'express-session';
import cookieParser from 'cookie-parser';

const app = express();

const redisStore = connectRedis(session);

app.use(helmet());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

//log
if (!module.parent) app.use(logger('dev'));

app.use('/static', express.static(path.join(__dirname, 'public')));

app.use(session({
    store: new redisStore({
        client: redisClient,
        prefix: "session:",
        db: 0
    }),
    saveUninitialized: false,
    resave: false,
    secret: process.env.SESSION_KEY,
    cookie: {maxAge: 5.256e+9, Secure: true, httpOnly:true} //2달
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
initPassport(passport);

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

// allow overriding methods in query (?_method=put)
app.use(methodOverride('_method'));

const server = app.listen(3000, () => console.log('port 3000 Server On'));
socket(server);

// import {router as indexRouter} from './routes/index';
import indexRouter from './routes/index';
app.use('/', indexRouter);

//이미지 라우터
import uploadRouter from './routes/upload';
app.use('/upload', uploadRouter);

// 인증 라우터
import authRouter from "./routes/auth";
app.use('/auth', authRouter);

//방 검색 라우터
import searchRouter from "./routes/room/search";
app.use('/search', searchRouter);

// 방 세부페이지,확인 및 결제 라우터
import detailRouter from "./routes/room/detail";
app.use('/rooms', detailRouter);

// 위치정보 전달 라우터
import locationRouter from "./routes/room/location";
app.use('/location', locationRouter);

// 메시지 라우터
import messageRouter from "./routes/user/message";
app.use('/message', messageRouter);

// 예약한 방에 대한 라우터
import reservationRouter from "./routes/user/trip";
app.use('/trip', reservationRouter);

// 호스트의 방 등록 라우터
import hostRouter from "./routes/user/host";
app.use('/host', hostRouter);

//카카오페이 API 연동 라우터
import kakaoPayRouter from "./routes/api/kakao_pay";
app.use('/kakao', kakaoPayRouter);

//파파고 API 연동 라우터
import papagoRouter from "./routes/api/papago_lang";
app.use('/papago', papagoRouter);

// 없는 페이지 혹은 오류
import errorRouter from "./routes/error";
app.use(errorRouter);
