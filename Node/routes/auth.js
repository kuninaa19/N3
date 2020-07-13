import express from 'express';
import passport from 'passport';
import initPassport from "../conf/passport";
import config from "../conf/config";
import jwt from 'jsonwebtoken';
import randToken from 'rand-token';

initPassport(passport);

const router = express.Router();

// local- login, register
const localLogin = (req, res) => {
    const payload = {
        'nickname': req.user.nickname,
        'way': req.user.way
    };

    jwt.sign(payload, config.JWT_SECRET, (err, token) => {
        const options = { //30분
            maxAge: 1.8e+6,
            secure: true,
            httpOnly: true
        };

        req.session.refreshToken = randToken.uid(256); //리프레시 토큰
        res.cookie(`accessToken`, token, options);

        res.redirect('/');
    });
};

router.post('/jwt',
    passport.authenticate('jwt'), (req, res) => {
        res.json({success: 'You are authenticated with JWT!', user: req.user})
    });

router.post('/login',
    passport.authenticate('local-login', {
        failureRedirect: '/',
        failureFlash: true
    }), (req, res) => localLogin(req, res)
);

//로그인을해도 메인화면으로 가는건 동일하지만 로그인시에는 닉네임이 떠야함

router.post('/register',
    passport.authenticate(
        'local-register',
        {
            failureRedirect: '/',
            failureFlash: true
        }), (req, res) => localLogin(req, res)
);

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
            secure: true,
            httpOnly: true
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
            secure: true,
            httpOnly: true
        };
        res.cookie(`accessToken`, accessToken, options);

        res.redirect('/');
    }
);

export default router;
