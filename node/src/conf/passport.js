import bCrypt from 'bcrypt';
import connection from "./dbInfo.js";
import config from './config.js';
import local from 'passport-local';
import jwt from 'passport-jwt';
import kakao from 'passport-kakao';
import naver from 'passport-naver';

const {Strategy: LocalStrategy} = local;
const {Strategy: JwtStrategy} = jwt;
const {ExtractJwt: ExtractJwt} = jwt;
const {Strategy: KakaoStrategy} = kakao;
const {Strategy: NaverStrategy} = naver;

//이미 가입된 회원인지 확인[local,naver,kakao]
const checkSignIn = (inputData, done) => {
    connection.query('select * from `users` where `email` = ?', inputData.email, (err, row) => {
        if (err) {
            console.log('checkSignIn : failure', err);

            return done(null, false, {message: ` 이메일을 사요엥 동의해주세요`});
            // throw err;
        }
        // 아이디없음
        if (row.length === 0) {
            signUp(inputData, done);
            //아이디 있음
        } else if (row[0].email === inputData.email) {
            if (row[0].way === 'general') {
                return done(null, false, {message: `이미 가입된 회원입니다.`});
            } else {
                // [naver,kakao] 로그인
                signIn(row, inputData, done);
            }
        }
    });
};

// 로컬 로그인 회원가입확인
const checkLocalSignIn = (inputData, done) => {
    connection.query('select * from `users` where `email` = ?', inputData.email, (err, row) => {
        if (err) {
            console.log('err :' + err);
            throw err;
        }
        if (row.length === 0) {
            return done(false, null, {message: '없는 아이디 입니다.'});
            //아이디 틀림
        } else if (row[0].way !== inputData.way) {
            return done(null, false, {message: `이미 ${row[0].way}로 가입된 회원입니다.`});
        } else if (row[0].email !== inputData.email) {
            console.log('아이디 틀림');
            return done(null, false, {message: '틀린 이메일입니다.'})
            //비번 틀림
        } else if (!bCrypt.compareSync(inputData.password, row[0].password)) {
            console.log('비번 틀림');
            return done(null, false, {message: '틀린 비밀번호 입니다.'})
        }
        return done(null, {
            // email: row[0].email,
            nickname: row[0].nickname,
            way: row[0].way
        });
    });
};

//회원가입 [ local,kakao,naver]
const signUp = (inputData, done) => {
    if (inputData.way === 'general') {
        connection.query('insert into `users` set ?', inputData, function (err, row) {
            if (err) throw  err;
            return done(null, {
                // email: inputData.email,
                nickname: inputData.nickname,
                way: inputData.way
            });
        });
    } else {
        const user = {
            email: inputData.email,
            nickname: inputData.nickname,
            way: inputData.way,
        };

        connection.query('insert into `users` set ?', user, function (err, row) {
            if (err) throw  err;
            return done(null, inputData);
        });
    }
};

// naver kakao 로그인
const signIn = (dbRow, inputData, done) => {
    if (dbRow[0].way === inputData.way) {
        return done(null, inputData);
    } else {
        return done(null, false, {message: `이미 ${dbRow[0].way}로 가입된 회원입니다.`});
    }
};

const initPassport = (passport) => {
    const opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    opts.secretOrKey = config.JWT_SECRET;

    passport.use(new JwtStrategy(opts, (jwtPayload, next) => {
        console.log('payload received', jwtPayload);
        connection.query('select * from `users` where `nickname` = ?', jwtPayload.nickname, (err, row) => {
            if (err) {
                console.log('err :' + err);
                throw err;
            }
            if (row.length === 0) {
                next(null, false);
            } else {
                next(null, jwtPayload);
            }
        });
    }));

    passport.use('local-login', new LocalStrategy({
        usernameField: 'email' //이 부분이 index.ejs의 name 부분을 가져온다.
    }, (id, password, done) => {
        let user = {
            'email': id,
            'password': password,
            'way': 'general'
        };
        checkLocalSignIn(user, done);
    }));

    passport.use('local-register', new LocalStrategy({
        usernameField: 'email', //이 부분이 index.ejs의 name 부분을 가져온다.
        passReqToCallback: true // username, email 외의 정보 받을수있도록 함(request)
    }, (req, id, password, done) => {
        let user = {
            'email': id,
            'password': bCrypt.hashSync(password, 10),
            'nickname': req.body.nickname,
            'way': 'general'
        };

        checkSignIn(user, done);
    }));

    passport.use(new NaverStrategy({
            clientID: config.oauth.naver.client_id,
            clientSecret: config.oauth.naver.client_secret,
            callbackURL: config.oauth.naver.callback_url
        },
        (accessToken, refreshToken, profile, done) => {
            const user = {
                'email': profile._json.email,
                'nickname': profile._json.nickname,
                'way': profile.provider,
                'accessToken': accessToken,
                'refreshToken': refreshToken
            };

            checkSignIn(user, done);
        }
    ));

    passport.use(new KakaoStrategy({
            clientID: config.oauth.kakao.rest_api_key,
            clientSecret: config.oauth.kakao.client_secret,
            callbackURL: config.oauth.kakao.callback_url
        },
        function (accessToken, refreshToken, profile, done) {
            const user = {
                // 'id':profile._json.id
                'email': profile._json.kakao_account.email,
                'nickname': profile.username,
                'way': profile.provider,
                'accessToken': accessToken,
                'refreshToken': refreshToken
            };

            checkSignIn(user, done);
        }
    ));

//세션에 대한 세팅
// passport.authenticate 함수가 정상 작동한다.
// 첫 로그인 시에만
    passport.serializeUser((user, done) => {
        console.log('serialize', user);
        //세션에 passport user아이디 저장

        done(null, user);
    });
// 저장된 세션을 확인( 페이지에 로그인 정보 전달)
//데이터베이스에서 조회하고 가져와야됨
    passport.deserializeUser((user, done) => {
        console.log('deserializeUser', user);

        done(null, user);
    });
};

export default initPassport;