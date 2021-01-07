import request from 'request-promise-native';
import logger from '../loaders/logger';
import config from '../conf/config';
import bookingModel from '../models/booking';
import msgModel from '../models/message';

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
                'approval_url': config.base_url + '/kakao/payment/approve',
                'fail_url': config.base_url + '/kakao/payment/fail',
                'cancel_url': config.base_url + '/kakao/payment/cancel',
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

            const resKakaoPay = JSON.parse(approveResult);
            resKakaoPay.date = JSON.stringify(session.date);
            resKakaoPay.amount = JSON.stringify(resKakaoPay.amount);

            const bookingId = await bookingModel.storeBooking(resKakaoPay);

            await msgModel.storeMsg(bookingId, user, session);

            return bookingId;
        } catch (error) {
            console.log(`approveKakaoPay 에러 발생: ${error}`);
            logger.error(error);
        }
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

            await bookingModel.deleteBooking(resKakaoPay);

        } catch (error) {
            console.log(`cancelKakaoPay 에러 발생: ${error}`);
            logger.error(error);
        }
    }
}