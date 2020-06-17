import express from 'express';
import connection from '../../conf/dbInfo';
import config from '../../conf/config';
import request from 'request-promise-native';
// import request from 'request';

const router = express.Router();

router.post('/payment/ready', (req, res) => {
    console.log(req.body);

    const headers = {
        'Authorization': 'KakaoAK ' + config.oauth.kakao.admin_key,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
    };

    const params = {
        'cid': 'TC0ONETIME',
        'partner_order_id': 'test',
        'partner_user_id': 'test', //req.user.email로 변경
        'item_name': req.body.hotel_name,
        'quantity': req.body.day, //상품수량 - 며칠 묵는지
        'total_amount': req.body.price.total,
        'vat_amount': 0,
        'tax_free_amount': 0,
        'approval_url': 'https://hotelbooking.kro.kr/kakao/payment/approve',
        'fail_url': 'https://hotelbooking.kro.kr/kakao/payment/fail',
        'cancel_url': 'https://hotelbooking.kro.kr/kakao/payment/cancel',
    };

    const options = {
        url: 'https://kapi.kakao.com/v1/payment/ready',
        method: 'POST',
        headers: headers,
        form: params
    };

    const get_info = async () => {
        try {
            const result = await request(options, (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    return body;
                }
            });

            const val = JSON.parse(result);
            //세션에 tid(결제 고유 번호) 저장 - 없으면 결제 승인완료 안됨
            req.session.tid = val.tid;
            // 예약하려는 날짜 저장
            req.session.date = req.body.date;
            // 결제하려는 숙박 현재 가격 저장
            req.session.price = req.body.price;
            // 호스트에게 보내는 메세지 임시 저장
            req.session.message = req.body.message;

            req.session.save(() => {
                return res.json(val.next_redirect_pc_url);
            });
        } catch (e) {
            console.log(e)
        }
    };

    get_info();

    /* promise  return 값 전달
         const get_info = () => {
            return new Promise(function(resolve, reject){
                request(options, function (error, response, body) {
                    // in addition to parsing the value, deal with possible errors
                    if (error) return reject(error);
                    try {
                        // JSON.parse() can throw an exception if not valid JSON
                        resolve(JSON.parse(body));
                    } catch(e) {
                        reject(e);
                    }
                });
            });
        }
        get_info().then(function(val) {
            console.log(val);
            // return val;
            return res.json(val);
        }).catch(function(err) {
            console.err(err);
        });
    */
});

router.get('/payment/approve', (req, res) => {

    const headers = {
        'Authorization': 'KakaoAK ' + config.oauth.kakao.admin_key,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
    };

    const params = {
        'cid': 'TC0ONETIME',
        'tid': req.session.tid,
        'partner_order_id': 'test',
        'partner_user_id': 'test',//req.user.email
        'pg_token': req.query.pg_token
    };

    const options = {
        url: 'https://kapi.kakao.com/v1/payment/approve',
        method: 'POST',
        headers: headers,
        form: params
    };

    const get_info = async () => {
        try {
            const result = await request(options, (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    return body;
                }
            });
            //처리완료되면 DB에 예약 내용저장
            const val = JSON.parse(result);

            val.date = JSON.stringify(req.session.date);
            //JSON 문자열로 바꿔서 넣어야 JSON형태 저장가능
            val.amount = JSON.stringify(val.amount);

            const sql = 'insert into `order` set ?';
            connection.query(sql, val, (err, result) => {
                if (err) throw  err;

                // 세션 삭제
                delete req.session.tid;
                delete req.session.date;
                delete req.session.price;
                delete req.session.message;

                req.session.save(() => {
                    // 창닫고 예약페이지로 이동
                    res.send("<script>opener.location.href=`https://hotelbooking.kro.kr/rooms/13`; window.close();</script>");
                });
            });
        } catch (e) {
            console.log(e)
        }
    };

    get_info();
});

// 결제 취소시 창 닫기
router.get('/payment/cancel', (req, res) => {
    res.send("<script> window.close(); </script>");
});

// 결제 실패시 알림뜨고 창 닫음
router.get('/payment/fail', (req, res) => {
    res.send("<script> alert('다시 시도해 주세요'); window.close(); </script>");
});

export default router;
