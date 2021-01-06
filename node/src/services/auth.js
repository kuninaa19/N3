import request from "request-promise-native";
import bCrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import connection from '../loaders/mysql';
import config from "../conf/config";

export default class AuthService {
    constructor() {
    }

    generateToken(user) {
        return jwt.sign(user, config.jwt_secret, {
            expiresIn: '30m',
            issuer: 'hotelbooking'
        });
    }

    //이미 가입된 회원인지 확인[local,naver,kakao]
    checkSignIn(user, done) {
        connection.query('SELECT * FROM `person` WHERE `email` = ?', user.email, (err, rows) => {
            if (err) {
                console.log('checkSignIn : failure', err);

                return done(null, false, {message: ` 이메일사용에 동의해주세요`});
                // throw err;
            }
            // 아이디없음
            if (rows.length === 0) {
                this.signUp(user, done);
                //아이디 있음
            } else if (rows[0].email === user.email) {
                if (rows[0].platform === 'general') {
                    return done(null, false, {message: `이미 가입된 회원입니다.`});
                } else {
                    // [naver,kakao] 로그인
                    this.signIn(rows, user, done);
                }
            }
        });
    }

    // 로컬 로그인 회원가입확인
    checkLocalSignIn(user, done) {
        connection.query('SELECT * FROM `person` WHERE `email` = ?', user.email, (err, rows) => {
            if (err) {
                console.log('err :' + err);
                throw err;
            }
            if (rows.length === 0) {
                return done(false, null, {message: '없는 아이디 입니다.'});
                //아이디 틀림
            } else if (rows[0].platform !== user.platform) {
                return done(null, false, {message: `이미 ${rows[0].platform}로 가입된 회원입니다.`});
            } else if (rows[0].email !== user.email) {
                console.log('아이디 틀림');
                return done(null, false, {message: '틀린 이메일입니다.'})
                //비번 틀림
            } else if (!bCrypt.compareSync(user.password, rows[0].password)) {
                console.log('비번 틀림');
                return done(null, false, {message: '틀린 비밀번호 입니다.'})
            }
            return done(null, {
                // email: rows[0].email,
                nickname: rows[0].nickname,
                platform: rows[0].platform
            });
        });
    }

    //회원가입 [ local,kakao,naver]
    signUp(user, done) {
        if (user.platform === 'general') {
            connection.query('INSERT INTO `person` SET ?', user, function (err) {
                if (err) throw err;
                return done(null, {
                    // email: user.email,
                    nickname: user.nickname,
                    platform: user.platform
                });
            });
        } else {
            const userDAO = {
                email: user.email,
                nickname: user.nickname,
                platform: user.platform,
            };

            connection.query('INSERT INTO `person` SET ?', userDAO, function (err) {
                if (err) throw err;
                return done(null, user);
            });
        }
    }

    // naver kakao 로그인
    signIn(dbRow, user, done) {
        if (dbRow[0].platform === user.platform) {
            return done(null, user);
        } else {
            return done(null, false, {message: `이미 ${dbRow[0].platform}로 가입된 회원입니다.`});
        }
    }

    // 유저정보 DB 삭제
    async deleteUser(user) {
        return new Promise((resolve, reject) => {
            const sql = 'DELETE FROM `person` WHERE nickname = ?';
            connection.query(sql, user, (err) => {
                if (err) throw reject(err);

                resolve(true);
            });
        }).catch(err => {
            console.log(err);
            return false;
        });
    }

    setOptions(user) {
        if (user.platform === 'kakao') {
            const options = {
                url: 'https://kapi.kakao.com/v1/user/unlink',
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user.token}`,
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
                    'access_token': user.token,
                    'client_id': config.oauth.naver.client_id,
                    'client_secret': config.oauth.naver.client_secret,
                    'grant_type': 'delete'
                }
            };
            return options;
        }
    }

    // 카카오와 네이버 플랫폼 연결해제
    async unlinkPlatform(options) {
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
    }

    //  회원탈퇴
    async withdrawal(user) {
        if (user.platform === 'general') {
            const result = await this.deleteUser(user.nickname); // 일반로그인 회원젇보 삭제
            return result;
        } else {
            const options = this.setOptions(user); // 옵션설정
            const key = await this.unlinkPlatform(options); //  링크해제

            if (key) {
                const result = await this.deleteUser(user.nickname);
                return result;
            }
            return key;
        }
    }
}