import request from "request-promise-native";
import jwt from 'jsonwebtoken';
import config from "../../conf/config";
import logger from "../../loaders/logger";

// 토큰 인증 실패
const notAuthenticated = (req, res) => {
    res.clearCookie('accessToken');
    req.logout();
    req.session.save(function () {
        res.redirect('/');
    });
}

// verifyToken() 내부 API 요청 옵션 설정
const setVerifyPlatformTokenOptions = (user) => {
    return new Promise((resolve) => {
        const optionConfig = {
            headers: {
                'Authorization': `Bearer ${user.token}`,
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
            },
            method: 'GET'
        }
        if (user.platform === 'naver') {
            const options = Object.assign({
                url: 'https://openapi.naver.com/v1/nid/me',
            }, optionConfig);

            resolve(options);

        } else if (user.platform === 'kakao') {
            const options = Object.assign({
                url: 'https://kapi.kakao.com/v1/user/access_token_info',
            }, optionConfig);

            resolve(options);
        }
    })
};

// getToken() 내부 API 요청 옵션 설정 [Naver, Kakao]
const setGetPlatformTokenOptions = async (user) => {
    return new Promise((resolve) => {
        const paramsConfig = {
            grant_type: 'refresh_token',
            refresh_token: user.refreshToken,
        };

        const optionsConfig = {
            headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'},
            method: 'POST',
        };

        if (user.platform === 'naver') {
            const params = Object.assign({
                client_id: config.oauth.naver.client_id,
                client_secret: config.oauth.naver.client_secret
            }, paramsConfig);

            const options = Object.assign({
                url: 'https://nid.naver.com/oauth2.0/token',
                form: params
            }, optionsConfig);

            resolve(options);

        } else if (user.platform === 'kakao') {
            const params = Object.assign({
                client_id: config.oauth.kakao.rest_api_key,
                client_secret: config.oauth.kakao.client_secret
            }, paramsConfig);

            const options = Object.assign({
                url: 'https://kauth.kakao.com/oauth/token',
                form: params
            }, optionsConfig);

            resolve(options);
        }
    })
};

// 유효한 토큰인지 검사
const verifyPlatformToken = async (options, user, req, res) => {
    try {
        const result = await request(options, async (error, response, body) => {
            if (!error && response.statusCode === 200) {
                return body;
            }
        });
        logger.info('토큰[Naver,Kakao] 유효성검사 통과 값 : %o', JSON.parse(result));
    } catch (e) {
        console.log('토큰 만료 혹은 잘못된 토큰 => 토큰인증 필요');
        if (e.statusCode === 400 || e.statusCode === 401) {
            const msgData = JSON.parse(e.error);

            // code => kakao, resultcode => naver
            if (msgData.code === -401 || msgData.code === -2 || msgData.resultcode === '024') {
                console.log('토큰 재발급');
                await getPlatformToken(user, req, res);
            }
        } else {
            logger.error('🔥 Error verifyToken : %o', e);
            notAuthenticated(req, res);
        }
    }
};

// 만료되었거나 토큰이 안맞는 아이디에 대해서 리프레쉬토큰으로 액세스토큰 발급[Naver,Kakao]
const getPlatformToken = async (options, req, res) => {
    try {
        const result = await request(options, async (error, response, body) => {
            if (!error && response.statusCode === 200) {
                return body;
            }
        });

        const val = JSON.parse(result);
        logger.info('토큰 재발급 성공 : %o', val);

        if (val.error) { // 리프레시토큰 오류 네이버
            logger.error('🔥 Error getToken Naver : %o', val.error);
            notAuthenticated(req, res);
        }

        const time = (val.expires_in) * 1000;
        const cookieOptions = { // 초기로그인과 다르게 발급받는 만료시간에 맞게 저장 (네이버 1시간 카카오 6시간)
            maxAge: time,
            secure: true
        };
        res.cookie(`accessToken`, val.access_token, cookieOptions);

        if (val.refresh_token) {
            req.user.refreshToken = val.refresh_token;
            req.session.cookie.maxAge = 5.256e+9;

            req.session.save(function () {
            });
        }
    } catch (e) {
        logger.error('🔥 Error getToken : %o', e);
        notAuthenticated(req, res);
    }
};

// JWT토큰 인증요청전송[local]
const verifyJwtToken = async (data, req, res) => {
    try {
        jwt.verify(data.token, config.jwt_secret);
        logger.info('verifyJwtToken');
    } catch (e) {
        if (e.statusCode === 400 || e.statusCode === 401) {
            logger.info('토큰 재발급');
            await getJwtToken(req, res);
        } else {
            logger.error('🔥 Error verifyJwtToken : %o', e);
            notAuthenticated(req, res);
        }
    }
};

//JwtToken얻기 [local]
const getJwtToken = async (req, res) => {
    try {
        if (req.session.refreshToken) {
            jwt.sign(req.user, config.jwt_secret, {
                expiresIn: '30m',
                issuer: 'hotelbooking'
            }, (err, token) => {
                const options = { //30분
                    maxAge: 1.8e+6,
                    // secure: true,
                    httpOnly: true
                };
                logger.info('JWT getJwtToken');

                res.cookie(`accessToken`, token, options);
            });
        } else {
            logger.error('🔥 have no refreshToken');
            notAuthenticated(req, res);
        }
    } catch (e) {
        logger.error('error getJwtToken %o', e);
        notAuthenticated(req, res);
    }
};

// 어느 플랫폼의 토큰인지 확인
const isAuth = async (req, res, next) => {
    const user = {
        token: req.cookies.accessToken,
        refreshToken: req.user.refreshToken,
        platform: req.user.way
    };

    if (user.platform === 'general') {
        if (user.token) { // local JWT 토큰 유무 확인
            await verifyJwtToken(user, req, res);
        } else {
            await getJwtToken(req, res);
        }
        next();
    } else {
        if (user.token) { // 액세스 토큰 유무 확인
            const options = await setVerifyPlatformTokenOptions(user);
            await verifyPlatformToken(options, user, req, res);
        } else {
            const options = await setGetPlatformTokenOptions(user);
            await getPlatformToken(options, req, res);
        }
        next();
    }
};

export default isAuth;
