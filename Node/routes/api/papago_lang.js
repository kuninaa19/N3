import express from 'express';
import config from '../../conf/config';
import request from 'request-promise-native';

const router = express.Router();

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
        res.json(val);
        // res.send("<script>parent.after(val); </script>");
    } catch (e) {
        console.log(e)
    }
};
// 파파고 언어감지 API
router.post('/detectLangs', (req, res) => {
    const api_url = 'https://openapi.naver.com/v1/papago/detectLangs';

    console.log(req.body);
    const query = req.body.content;

    const options = {
        url: api_url,
        method: 'POST',
        form: {'query': query},
        headers: {
            'X-Naver-Client-Id': config.oauth.naver.client_id,
            'X-Naver-Client-Secret': config.oauth.naver.client_secret
        }
    };


    get_info();
});

export default router;
