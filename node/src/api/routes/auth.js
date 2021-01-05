import {Router} from 'express';
import passport from 'passport';
import middlewares from '../middlewares';
import AuthService from '../../services/auth';
import refreshToken from "rand-token";
import logger from '../../loaders/logger';

const route = Router();

export default (app) => {
    app.use('/auth', route);

    route.post('/login',
        passport.authenticate('local-login', {
            failureRedirect: '/',
            failureFlash: true
        }), (req, res) => {
            const userDTO = {
                'nickname': req.user.nickname,
                'platform': req.user.platform
            };

            const authServiceInstance = new AuthService();
            const jwtToken = authServiceInstance.generateToken(userDTO);

            req.session.refreshToken = refreshToken.uid(256);
            res.cookie(`accessToken`, jwtToken, {
                maxAge: 1.8e+6, //30분
                httpOnly: true
            });
            res.redirect('/');
        }
    );

    route.post('/register',
        passport.authenticate(
            'local-register',
            {
                failureRedirect: '/',
                failureFlash: true
            }), (req, res) => {
            const userDTO = {
                'nickname': req.user.nickname,
                'platform': req.user.platform
            };

            const authServiceInstance = new AuthService();
            const jwtToken = authServiceInstance.generateToken(userDTO);

            req.session.refreshToken = refreshToken.uid(256);
            res.cookie(`accessToken`, jwtToken, {
                maxAge: 1.8e+6, //30분
                secure: true,
                httpOnly: true
            });
            res.redirect('/');
        }
    );

    route.delete('/withdrawal', middlewares.isAuth, async (req, res) => {
        try {
            const userDTO = {
                token: req.cookies.accessToken,
                platform: req.user.platform,
                nickname: req.user.nickname
            };

            const authServiceInstance = new AuthService();
            const result = await authServiceInstance.withdrawal(userDTO);

            res.clearCookie('accessToken');
            req.logout();
            req.session.destroy(function () {
                req.session; //세션 삭제
                res.json({key: result});
            });
        } catch (e) {
            logger.error('회원탈퇴 오류 : %o', e);
            res.json({key: false});
        }
    });

    // 네이버 로그인
    route.get('/naver',
        passport.authenticate('naver'));

    route.get('/naver/callback',
        passport.authenticate('naver', {
            failureRedirect: '/',
            failureFlash: true
        }), (req, res) => {
            const accessToken = req.user.accessToken;
            const cookieOptions = { //2시간
                maxAge: 7.2e+6,
                secure: true,
                httpOnly: true
            };
            res.cookie(`accessToken`, accessToken, cookieOptions);

            res.redirect('/');
        }
    );

    //카카오 로그인
    route.get('/kakao',
        passport.authenticate('kakao'));

    route.get('/kakao/callback',
        passport.authenticate('kakao', {
            failureRedirect: '/',
            failureFlash: true
        }), (req, res) => {
            const accessToken = req.user.accessToken;
            const cookieOptions = { //2시간 (네이버 1시간 카카오 6시간)
                maxAge: 7.2e+6,
                secure: true,
                httpOnly: true
            };
            res.cookie(`accessToken`, accessToken, cookieOptions);

            res.redirect('/');
        }
    );
};