import connection from '../loaders/mysql';
import logger from '../loaders/logger';
import moment from "moment";

export default class InfoService {
    constructor() {
    }

    //작성가능한 리뷰리스트 갸져오기
    async getAvailableReviewList(nickname) {
        return new Promise((resolve) => {
            // 유저가 숙박한적이있는지 확인 + 리뷰를 작성했는지 확인
            const sql = 'SELECT booking.id, booking.item_name, booking.date, (SELECT image_1 FROM `room_image` WHERE room.room_image_id = room_image.id) AS image, room.id AS room_id FROM `booking` INNER JOIN `room` ON booking.item_name = room.room_name WHERE booking.partner_user_id = ? AND booking.id NOT IN (SELECT review.booking_id FROM `review` WHERE review.user_name = ?)';
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
            const sql = 'SELECT room_name, score, content FROM `review` WHERE user_name = ?';
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

    // 작성할 숙소에 대한 정보 가져오기 
    async getInfoForReviewWriting(roomId) {
        return new Promise((resolve) => {
            const sql = 'SELECT room.room_name, room.country, room_image.image_1 AS image FROM `room` INNER JOIN `room_image` ON room.room_image_id = room_image.id WHERE room.id = ?';
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
            const sql = 'INSERT INTO `review` SET ?';
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