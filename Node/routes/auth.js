import express from 'express';
import passport from 'passport';
import initPassport from "../conf/passport";

initPassport(passport);

const router = express.Router();

//로그인을해도 메인화면으로 가는건 동일하지만 로그인시에는 닉네임이 떠야함
router.post('/login',
    passport.authenticate(
        'local-login',
        {
            successRedirect: '/',
            failureRedirect: '/',
            failureFlash: true
        }
    ));

router.post('/register',
    passport.authenticate(
        'local-register',
        {
            successRedirect: '/',
            failureRedirect: '/',
            failureFlash: true
        }
    ));

// 네이버 로그인
router.get('/naver',
    passport.authenticate('naver'));

router.get('/naver/callback',
    passport.authenticate('naver', {
        failureRedirect: '/',
        failureFlash: true
    }), (req, res) => {
        const accessToken = req.user.accessToken;
        const options = { //2시간
            maxAge: 7.2e+6,
            secure: true
        };
        res.cookie(`accessToken`, accessToken, options);

        res.redirect('/');
    }
);

//카카오 로그인
router.get('/kakao',
    passport.authenticate('kakao'));

router.get('/kakao/callback',
    passport.authenticate('kakao', {
        failureRedirect: '/',
        failureFlash: true
    }), (req, res) => {
        const accessToken = req.user.accessToken;
        const options = { //2시간 (네이버 1시간 카카오 6시간)
            maxAge: 7.2e+6,
            secure: true
        };
        res.cookie(`accessToken`, accessToken, options);

        res.redirect('/');
    }
);

export default router;
