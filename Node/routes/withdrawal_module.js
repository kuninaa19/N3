import request from "request-promise-native";
import connection from "../conf/dbInfo";

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

//  회원탈퇴
const userWithdrawal = async (req, res) => {
    const data = {
        token: req.cookies.accessToken,
        platform: req.user.way
    };

    if (data.platform === 'general') {
        const data = req.user.nickname;
        const result = await deleteUser(data, req, res); // 일반로그인 회원젇보 삭제

        return result;
    } else {
        await unlinkKakao(data, req, res); // 정보가져옴 유효하지않으면 재발급
    }
};

export default userWithdrawal;