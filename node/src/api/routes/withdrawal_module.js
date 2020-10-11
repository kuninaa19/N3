import request from "request-promise-native";
import connection from "../../conf/dbInfo.js";
import config from "../../conf/config.js";

// 유저정보 DB 삭제
const deleteUser = (data, req, res) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM `users` WHERE nickname = ?';
        connection.query(sql, data, (err, row) => {
            if (err) throw  reject(err);

            res.clearCookie('accessToken');
            req.logout();
            req.session.destroy(function () {
                req.session;
                resolve(true);
            });
        });
    }).catch(err => {
        console.log(err);
        return false;
    });
};

// 플랫폼별 다른 request 옵션 설정
const setOptions = (data) => {
    if (data.platform === 'kakao') {
        const options = {
            url: 'https://kapi.kakao.com/v1/user/unlink',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${data.token}`,
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
            }
        };
        return options;
    } else {
        const options = {
            url: 'https://nid.naver.com/oauth2.0/token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
            },
            params: {
                'access_token': data.token,
                'client_id': config.oauth.naver.client_id,
                'client_secret': config.oauth.naver.client_secret,
                'grant_type': 'delete'
            }
        };
        return options;
    }
};

// 카카오와 네이버 플랫폼 연결해제
const unlink = async (options) => {
    try {
        await request(options, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                return body;
            }
        });
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
};

//  회원탈퇴
const userWithdrawal = async (req, res) => {
    const data = {
        token: req.cookies.accessToken,
        platform: req.user.way,
        nickname: req.user.nickname
    };
    if (data.platform === 'general') {
        const result = await deleteUser(data.nickname, req, res); // 일반로그인 회원젇보 삭제

        return result;
    } else {
        const options = await setOptions(data); // 옵션설정
        const key = await unlink(options); //  링크해제

        if (key) {
            const result = await deleteUser(data.nickname, req, res); // 일반로그인 회원젇보 삭제

            return result;
        } else {
            return key;
        }
    }
};

export default userWithdrawal;