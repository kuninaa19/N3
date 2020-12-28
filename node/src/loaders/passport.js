import passport from 'passport';
import passportMiddleWare from '../conf/passport';
import flash from 'connect-flash';

export default async (app) => {
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash());

    // 사용자 객체를 세션에 아이디 저장
    passport.serializeUser((user, done) => {
        // console.log('serialize', user);
        done(null, user);
    });

    // 저장된 세션 확인후 사용자 정보객체로드
    passport.deserializeUser((user, done) => {
        // console.log('deserializeUser', user);
        done(null, user);
    });

    passportMiddleWare(passport);
};
