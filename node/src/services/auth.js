import request from "request-promise-native";
import bCrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from "../conf/config";
import personModel from '../models/person';

export default class AuthService {
    constructor() {
    }

    generateToken(user) {
        return jwt.sign(user, config.jwt_secret, {
            expiresIn: '30m',
            issuer: 'hotelbooking'
        });
    }

    //로그인 시도 및 회원가입[local,naver,kakao]
    async signIn(user, done) {
        const result = await personModel.getPerson(user.email);

        if (user.platform === 'general') {
            if (result.length === 0) {
                return done(false, null, {message: '존재하지않는 아이디 입니다.'});
            } else if (result[0].platform !== user.platform) {
                return done(null, false, {message: `이미 가입된 회원입니다.`});
            } else if (result[0].email !== user.email) {
                return done(null, false, {message: '틀린 이메일입니다.'});
            } else if (!bCrypt.compareSync(user.password, result[0].password)) {
                return done(null, false, {message: '틀린 비밀번호 입니다.'})
            }
            return done(null, {
                nickname: result[0].nickname,
                platform: result[0].platform
            });
        } else {
            if (result === false) {
                return done(null, false, {message: `이메일사용에 동의해주세요`});
            }
            // 아이디없음 혹은 회원가입
            else if (result.length === 0) {
                await this.signUp(user, done); // kakao, naver
                //아이디 있음
            } else if (result[0].email === user.email) {
                // [naver,kakao] 로그인
                if (result[0].platform === user.platform) {
                    return done(null, user);
                } else {
                    return done(null, false, {message: `이미 ${result[0].platform}로 가입된 회원입니다.`});
                }
            }
        }
    }

    //회원가입 [ local, kakao, naver ]
    async signUp(user, done) {
        const getPersonResult = await personModel.getPerson(user.email);

        if (getPersonResult.length === 0) {
            let personDAO = user;

            if (personDAO.platform !== 'general') { // naver, kakao signUp
                personDAO = {
                    email: user.email,
                    nickname: user.nickname,
                    platform: user.platform
                };
            }

            await personModel.storePerson(personDAO);

            let person = user;
            if (person.platform === 'general') {
                person = {
                    nickname: user.nickname,
                    platform: user.platform
                };
            }
            return done(null, person);

        } else {
            return done(null, false, {message: `이미 가입된 회원입니다.`});
        }
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
            const result = await personModel.deletePerson(user.nickname);// 일반로그인 회원젇보 삭제
            return result;
        } else {
            const options = this.setOptions(user); // 옵션설정
            const key = await this.unlinkPlatform(options); //  링크해제

            if (key) {
                const result = await personModel.deletePerson(user.nickname);
                return result;
            }
            return key;
        }
    }
}