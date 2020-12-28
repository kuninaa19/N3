import connection from '../loaders/mysql';
import logger from '../loaders/logger';
import moment from "moment";
import timezone from 'moment-timezone';

moment.tz.setDefault("Asia/Seoul");

export default class InfoService {
    constructor() {
    }

    //작성가능한 리뷰리스트 갸져오기
    async getAvailableReviewList(nickname) {
        return new Promise((resolve) => {
            // 유저가 숙박한적이있는지 확인 + 리뷰를 작성했는지 확인
            const sql = 'SELECT a.id, a.item_name, a.date,b.image, b.id as room_id FROM `orders` as `a` INNER JOIN `room` as `b` ON a.item_name = b.name WHERE a.partner_user_id = ? AND a.id NOT IN (SELECT c.order_id FROM `review` as `c` WHERE c.user_name = ?)';
            connection.query(sql, [nickname, nickname], (err, rows) => {
                if (err) throw err;

                // 숙박 날짜만 가져와서 재저장
                rows.forEach(function (val) {
                    val.date = JSON.parse(val.date);

                    // 년,월,일 한글 변환 적용
                    val.date.startDay = moment(val.date.startDay).format('LL');
                    val.date.endDay = moment(val.date.endDay).format('LL');
                });

                resolve(rows);
            });
        }).catch(error => {
            console.log(`getAvailableReviewList 에러 발생: ${error}`);
            logger.error(error);

            return false;
        });
    }

    // 리뷰작성한 리스트가져오기
    async getReviewList(nickname) {
        return new Promise((resolve) => {
            // 유저가 숙박한적이있는지 확인 + 리뷰를 작성했는지 확인
            const sql = 'SELECT room_name,score,content FROM `review` WHERE user_name = ?';
            connection.query(sql, nickname, (err, rows) => {
                if (err) throw err;
                resolve(rows);
            });
        }).catch(error => {
            console.log(`getReviewList 에러 발생: ${error}`);
            logger.error(error);

            return false;
        });
    }

    // 작성할 숙소리뷰정보에 대해 가져오기
    async getRoomInfo(roomId) {
        return new Promise((resolve) => {
            const sql = 'SELECT image,name,country FROM `room` WHERE id = ?';
            connection.query(sql, roomId, (err, rows) => {
                if (err) throw err;

                resolve(rows);
            });
        }).catch(error => {
            console.log(`getRoomInfo 에러 발생: ${error}`);
            logger.error(error);

            return false;
        });
    }

    // 작성된 리뷰 저장
    async storeReview(data) {
        return new Promise((resolve) => {
            const sql = 'insert into `review` set ?';
            connection.query(sql, data, (err) => {
                if (err) throw err;

                resolve(true);
            });
        }).catch(error => {
            console.log(`storeReview 에러 발생: ${error}`);
            logger.error(error);

            return false;
        });
    }
}