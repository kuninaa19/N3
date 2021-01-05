import bCrypt from 'bcrypt';
import {Strategy as LocalStrategy} from "passport-local";
import {Strategy as KakaoStrategy} from "passport-kakao";
import {Strategy as NaverStrategy} from "passport-naver";
import AuthService from '../services/auth';
import config from './config';

export default (passport) => {
    passport.use('local-login', new LocalStrategy({
        usernameField: 'email' //이 부분이 index.ejs의 name 부분을 가져온다.
    }, (id, password, done) => {
        let user = {
            'email': id,
            'password': password,
            'platform': 'general'
        };
        const authServiceInstance = new AuthService();
        authServiceInstance.checkLocalSignIn(user, done);
    }));

    passport.use('local-register', new LocalStrategy({
        usernameField: 'email', //이 부분이 index.ejs의 name 부분을 가져온다.
        passReqToCallback: true // username, email 외의 정보 받을수있도록 함(request)
    }, (req, id, password, done) => {
        let user = {
            'email': id,
            'password': bCrypt.hashSync(password, 10),
            'nickname': req.body.nickname,
            'platform': 'general'
        };
        const authServiceInstance = new AuthService();
        authServiceInstance.checkSignIn(user, done);
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
                'platform': profile.provider,
                'accessToken': accessToken,
                'refreshToken': refreshToken
            };
            const authServiceInstance = new AuthService();
            authServiceInstance.checkSignIn(user, done);
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
                'platform': profile.provider,
                'accessToken': accessToken,
                'refreshToken': refreshToken
            };
            const authServiceInstance = new AuthService();
            authServiceInstance.checkSignIn(user, done);
        }
    ));
};