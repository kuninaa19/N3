import express from 'express';
import connection from "../../conf/dbInfo.js";
import config from '../../conf/config.js';
import request from 'request-promise-native';

const router = express.Router();

// 언어감지된 값 저장
const storeLng = (val, data, res) => {
    // 멤버로 키를 가지고 있는지 확인
    if ("key" in data) {
        return new Promise((resolve, reject) => {
            const sql = 'UPDATE chat SET lang = ? WHERE room_id = ?';
            connection.query(sql, [val.langCode, data.room_id], (err, row) => {
                if (err) throw  err;
            });
            resolve(res.json({key: data.key}));
        }).catch(error => {
            console.log(`storeMessage 에러 발생: ${error}`);
        });
    } else {
        return new Promise((resolve, reject) => {
            const sql = 'UPDATE chat SET lang = ? WHERE room_id = ? AND id = ?';
            connection.query(sql, [val.langCode, data.room_id, data.item_id], (err, row) => {
                if (err) throw  err;
            });
            resolve(res.json(val));
        }).catch(error => {
            console.log(`storeMessage 에러 발생: ${error}`);
        });
    }
};

//언어감지 API
const detectLng = async (data, options, req, res) => {
    try {
        options.form = {'query': data.message};

        const result = await request(options, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                return body;
            } else {
                res.status(response.statusCode).end();
                console.log('error = ' + response.statusCode);
            }
        });
        const val = JSON.parse(result);

        await storeLng(val, data, res);

    } catch (e) {
        console.log(e)
    }
};
// 파파고 언어감지 API
router.post('/detectLangs', (req, res) => {
    const data = req.body;

    const api_url = 'https://openapi.naver.com/v1/papago/detectLangs';

    const options = {
        url: api_url,
        method: 'POST',
        headers: {
            'X-Naver-Client-Id': config.oauth.naver.client_id,
            'X-Naver-Client-Secret': config.oauth.naver.client_secret
        }
    };

    detectLng(data, options, req, res);
});

//언어 번역
const transLng = async (data, options, req, res) => {
    try {
        if (data.lang === 'ko') {
            options.form.target = 'en';
        } else {
            options.form.target = 'ko';
        }

        const result = await request(options, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                return body;
            } else {
                res.status(response.statusCode).end();
                console.log('error = ' + response.statusCode);
            }
        });
        const parsedResult = JSON.parse(result);

        const transMsg = {
            msg: parsedResult.message.result.translatedText,
            target: options.form.target
        };

        return res.json(transMsg);

    } catch (e) {
        console.log(e)
    }
};

// 파파고 언어번역 API
router.post('/translate', (req, res) => {
    const data = req.body;

    const api_url = 'https://openapi.naver.com/v1/papago/n2mt';

    const options = {
        url: api_url,
        method: 'POST',
        form: {'source': data.lang, 'target': '', 'text': data.message},
        headers: {
            'X-Naver-Client-Id': config.oauth.naver.client_id,
            'X-Naver-Client-Secret': config.oauth.naver.client_secret
        }
    };

    transLng(data, options, req, res);
});

export default router;
