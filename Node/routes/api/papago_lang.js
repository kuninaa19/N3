import express from 'express';
import connection from "../../conf/dbInfo";
import config from '../../conf/config';
import request from 'request-promise-native';

const router = express.Router();

// 언어감지된 값 저장
const storeLng = (room_id, result) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE `message` AS `a`, `chat` AS `b` SET a.lang = ?,b.lang = ? WHERE a.room_id=? AND b.room_id = ?';
        connection.query(sql, [result, result, room_id, room_id], (err, row) => {
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

        res.send({key: true});
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

export default router;
