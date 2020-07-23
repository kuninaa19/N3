import request from "request-promise-native";
import connection from "../conf/dbInfo";
import config from "../conf/config";

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
const setOptions = (token) => {
    const options = {
        url: 'https://kapi.kakao.com/v1/user/unlink',
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
        }
    };
    return options;
};

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
        const options = await setOptions(data.token); // 옵션설정
        const key = await unlink(options); // 카카오 링크해제

        console.log(key);
        if (key) {
            const result = await deleteUser(data.nickname, req, res); // 일반로그인 회원젇보 삭제

            return result;
        } else {
            return key;
        }
    }
};

export default userWithdrawal;