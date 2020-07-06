import express from 'express';
import connection from "../../conf/dbInfo";
import config from '../../conf/config';
import request from 'request-promise-native';

const router = express.Router();

// 언어감지된 값 저장
const storeLng = (room_id, result) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE chat SET lang = ? WHERE room_id = ?';
        connection.query(sql, [result, room_id], (err, row) => {
            if (err) throw  err;

            resolve(true);
        });
    }).catch(error => {
        console.log(`storeMessage 에러 발생: ${error}`);
    });
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

        await storeLng(data.room_id, val.langCode);

        if(data.key==='afterPayment'){
            res.send({key: true});
        }
        // res.send("<script>parent.after(val); </script>");
    } catch (e) {
        console.log(e)
    }
};
// 파파고 언어감지 API
router.post('/detectLangs', (req, res) => {
    const api_url = 'https://openapi.naver.com/v1/papago/detectLangs';

    const data = req.body;

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

// 파파고 언어번역 API
router.post('/translate', (req, res) => {
    console.log(req.body);
    const query = req.body;

    const api_url = 'https://openapi.naver.com/v1/papago/n2mt';

    const options = {
        url: api_url,
        method: 'POST',
        form: {'source': 'en', 'target': 'ko', 'text': query.number1},
        headers: {'X-Naver-Client-Id': client_id, 'X-Naver-Client-Secret': client_secret}
    };

    const get_info = async () => {
        try {
            const result = await request(options, (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    return body;
                } else {
                    res.status(response.statusCode).end();
                    console.log('error = ' + response.statusCode);
                }
            });
            const val = JSON.parse(result);
            console.log(val.message.result.translatedText);

            // return res.json(val.message.result.translatedText);
            return res.json(val);
        } catch (e) {
            console.log(e)
        }
    };

    get_info();
});

export default router;
