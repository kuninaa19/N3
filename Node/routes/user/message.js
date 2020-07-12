import express from 'express';
import connection from '../../conf/dbInfo';
import moment from 'moment';
import timezone from 'moment-timezone'; // require('moment-timezone');
import request from 'request-promise-native';
import config from "../../conf/config";

moment.tz.setDefault("Asia/Seoul");

// 시간 45분 -> 60분 일 22시간 -> 24시간
moment.relativeTimeThreshold('m', 60);
moment.relativeTimeThreshold('h', 24);
moment.relativeTimeThreshold('M', 30);

moment.updateLocale('ko', {
    relativeTime: {
        future: "%s 후",
        past: "%s 전",
        s: "%d 초",
        ss: "%d 초",
        m: "%d 분",
        mm: "%d 분",
        h: "%d 시간",
        hh: "%d 시간",
        d: "%d 일",
        dd: "%d 일",
        M: "%d 달",
        MM: "%d 달",
        y: "%d 년",
        yy: "%d 년"
    }
});

const router = express.Router();

const checkAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    //모달창 열기로 변경해야됨
    res.send("<script>alert('접속할 수 없는 페이지 입니다.'); history.go(-1);</script>");
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
                await getToken(data, req,res);
            }
        } else {
            console.log('로그아웃');
            delete req.session;
            delete res.cookie.accessToken;
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
const getToken = async (data, req,res) => {
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

        if(val.error){ // 리프레시토큰 오류 네이버
            console.log('로그아웃');
        }

        const time = (val.expires_in)*1000;
        const cookieOptions = { // 초기로그인과 다르게 발급받는 만료시간에 맞게 저장 (네이버 1시간 카카오 6시간)
            maxAge: time,
            secure: true
        };
        res.cookie(`accessToken`, val.access_token, cookieOptions);

        if(val.refresh_token){
            req.user.refreshToken = val.refresh_token;
            req.session.cookie.maxAge = 5.256e+9;

            req.session.save(function () {
            });
        }
    } catch (e) {
        // 리프레시 만료 혹은 리프레시 변조 => 사용자 로그아웃(카카오만)
        console.log(e);
    }
};

//메시지 최초 10개 전달
const searchMessages = (nickname, res) => {
    const sql = 'select  a.*, b.date, b.item_name,c.country,c.region from `message` AS `a` INNER JOIN `order` AS `b` INNER JOIN `room` AS `c` ON a.user_name = ? OR a.host_name = ? WHERE a.room_id = b.id AND b.item_name = c.name   GROUP BY a.time ORDER BY a.time DESC LIMIT 10';
    connection.query(sql, [nickname, nickname], (err, row) => {
        if (err) throw  err;

        // 대화하는 상대방 아이디
        let opponent = [];

        for (let i = 0; i < row.length; i++) {
            // 숙박날짜 JSON 파싱
            row[i].date = JSON.parse(row[i].date);

            // 년,월,일 한글 변환 적용
            row[i].date.startDay = moment(row[i].date.startDay).format('LL');
            row[i].date.endDay = moment(row[i].date.endDay).format('LL');

            // mysql에 저장된 시간에서 9시간을 빼고 비교해야 정확한 결과값이 나온다.
            row[i].time = moment(row[i].time).subtract(9, 'hours').fromNow();

            // 접속자가 집주인이면 방문객 이름, 접속자가 방문객이면
            // 집주인 이름
            if (row[i].host_name === nickname) {
                opponent[i] = row[i].user_name;
            } else {
                opponent[i] = row[i].host_name;
            }
        }

        res.render('user/message/message_index', {
            'nickname': nickname,
            'message': row,
            'opponent': opponent
        });
    });
};

// 유저 로그인했을때만 메시지페이지
router.get('/', checkAuth, async (req, res) => {
    const nickname = req.user.nickname;
    console.log(req.cookies.accessToken);
    console.log(req.session);

    const data = {
        token: req.cookies.accessToken,
        platform: req.user.way
    };

    if (data.platform !== 'general') {
        if (data.token) {
            console.log('토큰 있음');
            // 정보가져옴 유효하지않으면 재발급
            await verifyToken(data, req, res);
        } else {
            console.log('토큰 없음');
            // 토큰재발급 정보가져옴
            await getToken(data, req,res);
        }
    }

    searchMessages(nickname, res);
});

// 채팅창(메시지 상세페이지)
router.get('/:message_id', checkAuth, (req, res) => {
    const nickname = req.user.nickname;
    const searchValue = req.params.message_id;

    const sql = 'select  a.user_name,a.host_name,b.* from `message` AS `a` INNER JOIN `chat` AS `b` ON a.room_id=b.room_id WHERE b.room_id=? AND (a.user_name=? OR a.host_name=?) ORDER BY b.id asc';
    connection.query(sql, [searchValue, nickname, nickname], (err, row) => {
        if (err) throw  err;

        if (row.length === 0) {
            res.send("<script>alert('접속할 수 없는 페이지 입니다.'); history.go(-1);</script>");
        } else {
            // 대화하는 상대방 아이디
            let opponent;

            if (row[0].host_name === nickname) {
                opponent = row[0].user_name;
            } else {
                opponent = row[0].host_name;
            }

            // 날짜만 가져오기위한 배열
            let LLTime = [];

            for (let i = 0; i < row.length; i++) {
                // 날짜만 가져오기
                LLTime[i] = moment(row[i].time).subtract(9, 'hours').format('LL');

                // 년,월,일 한글 변환 적용
                row[i].time = moment(row[i].time).subtract(9, 'hours').format('LT');
            }

            res.render('user/message/message_detail', {
                'nickname': nickname,
                'contents': row,
                'LLTime': LLTime,
                'opponent': opponent
            });
        }
    });
});

export default router;
