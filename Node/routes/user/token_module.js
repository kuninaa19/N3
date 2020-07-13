import config from "../../conf/config";
import request from "request-promise-native";
import jwt from 'jsonwebtoken';

// 어느 플랫폼의 토큰인지 확인
const checkToken = async (req, res) => {
    const data = {
        token: req.cookies.accessToken,
        platform: req.user.way
    };

    if (data.platform !== 'general') {
        if (data.token) { // 액세스 토큰 유무 확인
            await verifyToken(data, req, res); // 정보가져옴 유효하지않으면 재발급
        } else {
            await getToken(data, req, res); // 토큰재발급 정보가져옴
        }
    } else {
        if (data.token) { // local JWT 토큰 유무 확인
            await verifyJwtToken(data, req, res); // 정보가져옴 유효하지않으면 재발급
        } else {
            await getJwtToken(data, req, res); // 토큰재발급 정보가져옴
        }
    }
};

// JWT토큰 인증요청전송[local]
const verifyJwtToken = async (data, req, res) => {
    try {
        const options = {
            url: 'https://hotelbooking.kro.kr/auth/jwt',
            headers: {
                'Authorization': `Bearer ${data.token}`,
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
            },
            method: 'POST',
        };

        const result = await request(options, async (error, response, body) => {
            if (!error && response.statusCode === 200) {
                return body;
            }
        });
        const val = JSON.parse(result);
        console.log('인증성공', val);

    } catch (e) {
        console.log('토큰 만료 혹은 잘못된 토큰 => 토큰인증 필요');
        if (e.statusCode === 400 || e.statusCode === 401) {
            console.log('토큰 재발급');
            await getJwtToken(data, req, res);
        } else {
            console.log('로그아웃');
            res.clearCookie('accessToken');
            req.logout();
            req.session.save(function () {
                res.redirect('/');
            });
        }
    }
};

//JwtToken얻기 [local]
const getJwtToken = async (data, req, res) => {
    try {
        if (req.session.refreshToken) {
            jwt.sign(req.user, config.JWT_SECRET, (err, token) => {
                const options = { //30분
                    maxAge: 1.8e+6,
                    secure: true,
                    httpOnly: true
                };

                res.cookie(`accessToken`, token, options);
            });
        } else {
            // 리프레시 만료 => 사용자 로그아웃
            res.clearCookie('accessToken');
            req.logout();
            req.session.save(function () {
                res.redirect('/');
            });
        }
    } catch (e) {
    }
};

// verifyToken() 내부 API 요청 옵션 설정
const setVerifyTokenOptions = (data) => {
    return new Promise((resolve, reject) => {
        if (data.platform === 'naver') {
            const options = {
                url: 'https://openapi.naver.com/v1/nid/me',
                headers: {
                    'Authorization': `'Bearer ${data.token}`,
                    // 'Authorization': `Bearer 32ro32rj32orj32i3jr23iorj32or32o`,
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
                },
                method: 'GET',
            };
            resolve(options);

        } else if (data.platform === 'kakao') {

            const options = {
                url: 'https://kapi.kakao.com/v1/user/access_token_info',
                headers: {
                    'Authorization': `Bearer ${data.token}`,
                    // 'Authorization': `Bearer 32ro32rj32orj32i3jr23iorj32or32o`,
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
                },
                method: 'GET',
            };
            resolve(options);
        }
    })
};

// 유효한 토큰인지 검사
const verifyToken = async (data, req, res) => {
    try {
        const options = await setVerifyTokenOptions(data);

        const result = await request(options, async (error, response, body) => {
            if (!error && response.statusCode === 200) {
                return body;
            }
        });

        const val = JSON.parse(result);
        console.log('인증성공', val);

    } catch (e) {
        console.log('토큰 만료 혹은 잘못된 토큰 => 토큰인증 필요');
        if (e.statusCode === 400 || e.statusCode === 401) {
            const msgData = JSON.parse(e.error);

            // code => kakao, resultcode => naver
            if (msgData.code === -401 || msgData.code === -2 || msgData.resultcode === '024') {
                console.log('토큰 재발급');
                await getToken(data, req, res);
            }
        } else {
            console.log('로그아웃');
            res.clearCookie('accessToken');
            req.logout();
            req.session.save(function () {
                res.redirect('/');
            });
        }
    }
};
// getToken() 내부 API 요청 옵션 설정
const setGetTokenOptions = async (data, req) => {
    return new Promise((resolve, reject) => {
        console.log('setGetTokenOptions');
        console.log(req.session);
        console.log(req.user.refreshToken);

        if (data.platform === 'naver') {
            const params = {
                grant_type: 'refresh_token',
                client_id: config.oauth.naver.client_id,
                refresh_token: req.user.refreshToken,
                client_secret: config.oauth.naver.client_secret
            };

            const options = {
                url: 'https://nid.naver.com/oauth2.0/token',
                headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'},
                method: 'POST',
                form: params
            };
            resolve(options);

        } else if (data.platform === 'kakao') {
            const params = {
                grant_type: 'refresh_token',
                client_id: config.oauth.kakao.rest_api_key,
                refresh_token: req.user.refreshToken,
                client_secret: config.oauth.kakao.client_secret
            };

            const options = {
                url: 'https://kauth.kakao.com/oauth/token',
                headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'},
                method: 'POST',
                form: params
            };
            resolve(options);
        }
    })
};

// 만료되었거나 토큰이 안맞는 아이디에 대해서 리프레쉬토큰으로 액세스토큰 발급
const getToken = async (data, req, res) => {
    try {
        const options = await setGetTokenOptions(data, req);
        console.log(options);
        console.log('토큰 재발급시도');

        const result = await request(options, async (error, response, body) => {
            if (!error && response.statusCode === 200) {
                return body;
            }
        });

        const val = JSON.parse(result);
        console.log('토큰 재발급 성공', val);
        // req.user.refreshToken = "val.refresh_token";

        if (val.error) { // 리프레시토큰 오류 네이버
            res.clearCookie('accessToken');
            req.logout();
            req.session.save(function () {
                res.redirect('/');
            });
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
        // 리프레시 만료 혹은 리프레시 변조 => 사용자 로그아웃(카카오만)
        // console.log(e);
        res.clearCookie('accessToken');
        req.logout();
        req.session.save(function () {
            res.redirect('/');
        });
    }
};

export default checkToken;
