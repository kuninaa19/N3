import request from 'request-promise-native';
import connection from '../loaders/mysql';
import logger from '../loaders/logger';
import config from '../conf/config';
import moment from 'moment';

export default class KakaoService {
    constructor() {
    }

    // -- /payment/ready 메서드, 결제준비
    async readyKakaoPay(room, user) {
        try {
            const headers = {
                'Authorization': 'KakaoAK ' + config.oauth.kakao.admin_key,
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
            };
            const params = {
                'cid': 'TC0ONETIME',
                'partner_order_id': room.host_name,
                'partner_user_id': user,
                'item_name': room.hotel_name,
                'quantity': room.day, //상품수량 - 며칠 묵는지
                'total_amount': room.price,
                'vat_amount': 0,
                'tax_free_amount': 0,
                'approval_url': 'http://localhost/kakao/payment/approve',
                'fail_url': 'http://localhost/kakao/payment/fail',
                'cancel_url': 'http://localhost/kakao/payment/cancel',
            };
            const options = {
                url: 'https://kapi.kakao.com/v1/payment/ready',
                method: 'POST',
                headers: headers,
                form: params
            };

            const readyResult = await request(options, (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    return body;
                }
            });
            const resKakaoPay = JSON.parse(readyResult);

            return resKakaoPay;
        } catch (error) {
            console.log(`readyKakaoPay 에러 발생: ${error}`);
            logger.error(error);
        }
    }

    // -- /payment/approve 메서드, 결제 승인요청
    async approveKakaoPay(session, user, token) {
        try {
            const headers = {
                'Authorization': 'KakaoAK ' + config.oauth.kakao.admin_key,
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
            };

            const params = {
                'cid': 'TC0ONETIME',
                'tid': session.tid,
                'partner_order_id': session.host_name,
                'partner_user_id': user,
                'pg_token': token
            };

            const options = {
                url: 'https://kapi.kakao.com/v1/payment/approve',
                method: 'POST',
                headers: headers,
                form: params
            };

            const approveResult = await request(options, (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    return body;
                }
            });

            //JSON 문자열로 바꿔서 넣어야 JSON형태 저장가능
            const resKakaoPay = JSON.parse(approveResult);
            resKakaoPay.date = JSON.stringify(session.date);
            resKakaoPay.amount = JSON.stringify(resKakaoPay.amount);

            const orderId = await this.storeOrder(resKakaoPay);

            await this.storeMsg(orderId, user, session);

            return orderId;
        } catch (error) {
            console.log(`approveKakaoPay 에러 발생: ${error}`);
            logger.error(error);
        }
    }

    //결제완료후 정보 DB 저장
    async storeOrder(order) {
        return new Promise(resolve => {
            const sql = 'insert into `orders` set ?';
            connection.query(sql, order, (err, rows) => {
                if (err) throw err;

                const storedOrderId = rows.insertId;

                resolve(storedOrderId);
            });
        }).catch(error => {
            console.log(`storeOrder 에러 발생: ${error}`);
            logger.error(error);
        });
    }

    // 메시지,채팅 DB 저장
    async storeMsg(orderId, user, session) {
        const time = moment().format('YYYY-MM-DD HH:mm:ss');

        const storeMessage = new Promise((resolve) => {
            const msg = {
                room_id: orderId,
                user_name: user,
                host_name: session.host_name,
                message: session.message,
                time: time
            };

            const sql = 'insert into `message` set ?';
            connection.query(sql, msg, (err) => {
                if (err) throw err;

                resolve(true);
            });
        }).catch(error => {
            console.log(`storeMsg 에러 발생: ${error}`);
            logger.error(error);
        });

        const storeChat = new Promise((resolve) => {
            const sendChat = {
                room_id: orderId,
                sender: user,
                content: session.message,
                time: time
            };
            const sql = 'insert into `chat` set ?';
            connection.query(sql, sendChat, (err) => {
                if (err) throw err;

                resolve(true);
            });
        }).catch(error => {
            console.log(`storeChat 에러 발생: ${error}`);
            logger.error(error);
        });
        Promise.all([storeMessage, storeChat]).then((values) => {
            if (values[0] === values[1]) {
                logger.info('promiseAll Done');
            }
        });
    }

    // -- /payment/cancel 메서드, DB저장된 주문 정보 삭제
    async cancelOrder(order) {
        return new Promise(resolve => {
            const sql = 'DELETE from `orders` WHERE tid=? AND item_name=?';
            connection.query(sql, [order.tid, order.item_name], (err) => {
                if (err) throw err;
                resolve();
            });
        }).catch(error => {
            console.log(`cancelOrder() 에러 발생: ${error}`);
            logger.error(error);
        });
    }

    // 결제 취소요청
    async cancelKakaoPay(room) {
        try {
            const headers = {
                'Authorization': 'KakaoAK ' + config.oauth.kakao.admin_key,
                // 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
            };

            const params = {
                'cid': 'TC0ONETIME',
                'tid': room.tid,
                'cancel_amount': room.amount,
                'cancel_tax_free_amount': 0,
            };

            const options = {
                url: 'https://kapi.kakao.com/v1/payment/cancel',
                method: 'POST',
                headers: headers,
                form: params
            };

            const cancelResult = await request(options, (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    return body;
                }
            });
            const resKakaoPay = JSON.parse(cancelResult);

            //처리완료되면 DB에 예약 삭제
            await this.cancelOrder(resKakaoPay);

        } catch (error) {
            console.log(`cancelKakaoPay 에러 발생: ${error}`);
            logger.error(error);
        }
    }
}