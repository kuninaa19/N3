import express from 'express';
import connection from '../../conf/dbInfo';
import config from '../../conf/config';
import request from 'request-promise-native';
// import request from 'request';
import moment from 'moment';

require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

const router = express.Router();

//결제준비
const readyPayment = async (options, req, res) => {
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
        req.session.message = req.body.message;
        req.session.host_name = req.body.host_name;

        req.session.save(() => {
            return res.json(val.next_redirect_pc_url);
        });
    } catch (e) {
        console.log(e)
    }
};

router.post('/payment/ready', (req, res) => {
    const headers = {
        'Authorization': 'KakaoAK ' + config.oauth.kakao.admin_key,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
    };

    const params = {
        'cid': 'TC0ONETIME',
        'partner_order_id': req.body.host_name,
        'partner_user_id': req.user.nickname,
        'item_name': req.body.hotel_name,
        'quantity': req.body.day, //상품수량 - 며칠 묵는지
        'total_amount': req.body.price,
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

    readyPayment(options, req, res);
});

// 메시지,채팅 DB 저장
const storeMessages = (data) => {
    const storeMessage = new Promise((resolve, reject) => {
        const sql = 'insert into `message` set ?';
        connection.query(sql, data, (err, row) => {
            if (err) throw  err;

            resolve(true);
        });
    }).catch(error => {
        console.log(`storeMessage 에러 발생: ${error}`);
    });

    const storeChat = new Promise((resolve, reject) => {
        const sendChat = {
            room_id: data.room_id,
            sender: data.user_name,
            content: data.message,
            time: data.time,
        };
        const sql = 'insert into `chat` set ?';
        connection.query(sql, sendChat, (err, row) => {
            if (err) throw  err;

            resolve(true);
            reject();
        });
    }).catch(error => {
        console.log(`storeChat 에러 발생: ${error}`);
    });
    Promise.all([storeMessage, storeChat]).then((values) => {
        if (values[0] === values[1]) {
            console.log('promiseAll');
        }
    });
};

//결제완료후 정보 DB 저장
const completePayment = (orderValue) => {
    return new Promise(resolve => {
        const sql = 'insert into `order` set ?';
        connection.query(sql, orderValue, (err, row) => {
            if (err) throw  err;

            const orderId = row.insertId;

            resolve(orderId);
        });
    }).catch(error => {
        console.log(`completePayment() 에러 발생: ${error}`);
    });
};

// 결제 승인요청
const approvePayment = async (options, req, res) => {
    try {
        const result = await request(options, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                return body;
            }
        });
        //처리완료되면 DB에 예약 내용저장
        const orderValue = JSON.parse(result);
        orderValue.date = JSON.stringify(req.session.date);
        //JSON 문자열로 바꿔서 넣어야 JSON형태 저장가능
        orderValue.amount = JSON.stringify(orderValue.amount);

        // console.log('approveVal', orderValue);

        //완료된 결제 db저장후 주문정보전달
        const orderId = await completePayment(orderValue);

        const message = {
            room_id: orderId,
            user_name: req.user.nickname,
            host_name: req.session.host_name,
            message: req.session.message,
            time: moment().format('YYYY-MM-DD HH:mm:ss')
        };

        //메시지 DB 저장
        await storeMessages(message);

        // 세션 삭제
        delete req.session.tid;
        delete req.session.date;
        delete req.session.message;
        delete req.session.host_name;

        req.session.save(() => {
            const room_id = message.room_id;
            const msg = message.message;

            // 파파고 언어감지 메소드 실행요청
            res.send(`<script>opener.location.href='javascript:detectLng(${room_id},"${msg}");'; window.close();</script>`);
        });
    } catch (e) {
        console.log(e)
    }
};

router.get('/payment/approve', (req, res) => {
    const headers = {
        'Authorization': 'KakaoAK ' + config.oauth.kakao.admin_key,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
    };

    const params = {
        'cid': 'TC0ONETIME',
        'tid': req.session.tid,
        'partner_order_id': req.session.host_name,
        'partner_user_id': req.user.nickname,
        'pg_token': req.query.pg_token
    };

    const options = {
        url: 'https://kapi.kakao.com/v1/payment/approve',
        method: 'POST',
        headers: headers,
        form: params
    };

    approvePayment(options, req, res);
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
