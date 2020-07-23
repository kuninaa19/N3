import express from 'express';
import passport from 'passport';
import initPassport from "../conf/passport";
import config from "../conf/config";
import jwt from 'jsonwebtoken';
import randToken from 'rand-token';
import checkToken from "./user/token_module";
import userWithdrawal from "./withdrawal_module";

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

router.post('/register',
    passport.authenticate(
        'local-register',
        {
            failureRedirect: '/',
            failureFlash: true
        }), (req, res) => localLogin(req, res)
);

router.delete('/withdrawal', async (req, res) => {
    try {
        await checkToken(req, res);

        const result = await userWithdrawal(req, res);
        res.json({key: result});
    } catch (e) {
        console.log(e);

        res.json({key: false});
    }
});

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
