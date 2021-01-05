import request from 'request-promise-native';
import connection from '../loaders/mysql';
import logger from '../loaders/logger';
import config from '../conf/config';

export default class PapagoService {
    constructor() {
    }

    //언어감지 API
    async detectLang(chat) {
        try {
            const api_url = 'https://openapi.naver.com/v1/papago/detectLangs';

            const options = {
                url: api_url,
                method: 'POST',
                headers: {
                    'X-Naver-Client-Id': config.oauth.naver.client_id,
                    'X-Naver-Client-Secret': config.oauth.naver.client_secret
                }
            };

            options.form = {'query': chat.message};

            const detectResult = await request(options, (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    return body;
                } else {
                    response.status(response.statusCode).end();
                    // res.status(response.statusCode).end();
                    console.log('error = ' + response.statusCode);
                }
            });
            const resPapago = JSON.parse(detectResult);
            const langResult = await this.storeLang(resPapago, chat);

            return langResult;

        } catch (error) {
            console.log(`detectLang 에러 발생: ${error}`);
            logger.error(error);

        }
    }

    // 언어감지된 값 저장
    async storeLang(resPapago, chat) {
        // 멤버로 키를 가지고 있는지 확인
        if ("key" in chat) {
            return new Promise((resolve) => {
                const sql = 'UPDATE chat SET lang = ? WHERE room_id = ?';
                connection.query(sql, [resPapago.langCode, chat.room_id], (err) => {
                    if (err) throw err;
                });
                resolve({key: chat.key});
            }).catch(error => {
                console.log(`storeLang if문 에러 발생: ${error}`);
                logger.error(error);

            });
        } else {
            return new Promise((resolve) => {
                const sql = 'UPDATE chat SET lang = ? WHERE room_id = ? AND id = ?';
                connection.query(sql, [resPapago.langCode, chat.room_id, chat.item_id], (err) => {
                    if (err) throw err;
                });
                resolve(resPapago);
            }).catch(error => {
                console.log(`storeLang else문 에러 발생: ${error}`);
                logger.error(error);
            });
        }
    }

    //언어 번역
    async transLang(chat) {
        try {
            const api_url = 'https://openapi.naver.com/v1/papago/n2mt';

            const options = {
                url: api_url,
                method: 'POST',
                form: {'source': chat.lang, 'target': '', 'text': chat.message},
                headers: {
                    'X-Naver-Client-Id': config.oauth.naver.client_id,
                    'X-Naver-Client-Secret': config.oauth.naver.client_secret
                }
            };

            if (chat.lang === 'ko') {
                options.form.target = 'en';
            } else {
                options.form.target = 'ko';
            }

            const translateResult = await request(options, (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    return body;
                } else {
                    response.status(response.statusCode).end();
                    console.log('error = ' + response.statusCode);
                }
            });
            const resPapago = JSON.parse(translateResult);

            const transMsg = {
                msg: resPapago.message.result.translatedText,
                target: options.form.target
            };

            return transMsg;
        } catch (error) {
            console.log(`transLang 에러 발생: ${error}`);
            logger.error(error);
        }
    }
}