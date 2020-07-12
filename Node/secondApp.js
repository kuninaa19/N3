import express from 'express';
import logger from 'morgan';
import path from 'path';
import methodOverride from 'method-override'; // put, delete 메소드 지원하기위해서
import helmet from 'helmet';
import session from 'express-session';
import flash from 'connect-flash';
import passport from 'passport';
import initPassport from './conf/passport';
import socket from "./socket_io";
//추후 redis로 변경
import sessionStore from 'session-file-store';
const FileStore = sessionStore(session);

const app = express();

app.use(helmet());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

//log
if (!module.parent) app.use(logger('dev'));

// serve static files
app.use('/static', express.static(path.join(__dirname, 'public')));

// session support
app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: 'WEfh#joi!P#GTH$#(',
    store: new FileStore()
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
initPassport(passport);

app.use(express.json());
// parse request bodies (req.body) body-parser 대안
app.use(express.urlencoded({extended: true}));

// allow overriding methods in query (?_method=put)
app.use(methodOverride('_method'));

const server = app.listen(3001, () => console.log('port 3001 Server On'));
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