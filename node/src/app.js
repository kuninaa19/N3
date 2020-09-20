import express from 'express';
import logger from 'morgan';
import path from 'path';
import methodOverride from 'method-override';
import helmet from 'helmet';
import passport from 'passport';
import flash from 'connect-flash';
import connectRedis from 'connect-redis';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import initPassport from './conf/passport.js';
import socket from "./socket_io.js";
import {redisClient, redisSecret} from './conf/redis.js';

import indexRouter from './routes/index.js';
import uploadRouter from './routes/upload.js';
import authRouter from "./routes/auth.js";
import searchRouter from "./routes/room/search.js";
import detailRouter from "./routes/room/detail.js";
import locationRouter from "./routes/room/location.js";
import messageRouter from "./routes/user/message.js";
import reservationRouter from "./routes/user/trip.js";
import hostRouter from "./routes/user/host.js";
import infoRouter from "./routes/user/info.js";
import kakaoPayRouter from "./routes/api/kakao_pay.js";
import papagoRouter from "./routes/api/papago_lang.js";
import errorRouter from "./routes/error.js";

const app = express();

const redisStore = connectRedis(session);

const __dirname = path.resolve();

app.use(helmet());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/src/views'));

//log
// if (!module.parent) app.use(logger('dev'));

app.use('/static', express.static(path.join(__dirname, '/src/public')));

app.use(session({
    store: new redisStore({
        client: redisClient,
        prefix: "session:",
        db: 0
    }),
    saveUninitialized: false,
    resave: false,
    secret: redisSecret,
    cookie: {maxAge: 5.256e+9, Secure: true, httpOnly: true} //2달
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

const server = app.listen(3000, () => console.log('port 3000 Server On CD'));
socket(server);

app.use('/', indexRouter);
app.use('/upload', uploadRouter); //이미지 라우터
app.use('/auth', authRouter);// 인증 라우터
app.use('/search', searchRouter); //방 검색 라우터
app.use('/rooms', detailRouter); // 방 세부페이지,확인 및 결제 라우터
app.use('/location', locationRouter); // 위치정보 전달 라우터
app.use('/message', messageRouter); // 메시지 라우터
app.use('/trip', reservationRouter); // 예약한 방에 대한 라우터
app.use('/host', hostRouter); // 호스트의 방 등록 라우터
app.use('/info', infoRouter); // 유저 프로필 페이지 라우터
app.use('/kakao', kakaoPayRouter); //카카오페이 API 연동 라우터
app.use('/papago', papagoRouter); //파파고 API 연동 라우터
app.use(errorRouter);// 없는 페이지 혹은 오류
