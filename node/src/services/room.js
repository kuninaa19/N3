import connection from '../loaders/mysql';
import logger from '../loaders/logger';
import moment from "moment";

export default class RoomService {
    constructor() {
    }

    // 메인페이지 하단 숙소카드를 위한 숙소정보가져오기
    async getRecentRoomList() {
        return new Promise((resolve) => {
            const sql = 'SELECT room.id, room.room_name AS name, room.region, room_image.image_1 AS image FROM `room` INNER JOIN `room_image` ON room.room_image_id = room_image.id ORDER BY id DESC LIMIT 4';
            connection.query(sql, (err, rows) => {
                if (err) throw err;
                resolve(rows);
            });
        }).catch(error => {
            console.log(`getRecentRoomList() 에러 발생: ${error}`);
            logger.error(error);
        });
    }

    // 검색한 지역 숙소정보 리스트 가져오기
    async getRoomList(searchValue) {
        return new Promise((resolve) => {
            const sql = 'SELECT room.id, room.room_name AS name, room.region, room.price, (SELECT image_1 FROM `room_image` WHERE room.room_image_id = room_image.id) AS image, (SELECT COUNT(*) FROM `review` WHERE room.room_name = room_name) AS count, (SELECT SUM(score) FROM `review` WHERE room.room_name = room_name) AS score FROM `room` WHERE room.region = ?';
            connection.query(sql, searchValue, (err, rows) => {
                if (err) throw err;

                // 하루 숙박비 값만 가져와서 재저장, 평점 재저장
                rows.forEach(function (val) {
                    val.price = JSON.parse(val.price).perDay;
                    if (val.count === 0) {
                        val.score = 0;
                    } else {
                        val.score = (val.score / val.count).toFixed(1);
                    }
                });
                resolve(rows);
            });
        }).catch(error => {
            console.log(`getRoomList() 에러 발생: ${error}`);
            logger.error(error);
            return false;
        });
    }

    // 방 세부페이지정보 가져오기
    async getRoomDetail(searchValue) {
        return new Promise((resolve) => {
            // 숙소정보 가져옴
            const sql = 'SELECT room.*, img.image_1, img.image_2, img.image_3, img.image_4, img.image_5 FROM `room` INNER JOIN `room_image` as img  ON room.room_image_id = img.id  WHERE room.id = ?';
            connection.query(sql, searchValue, (err, rows) => {
                if (err) throw err;

                // 하루 숙박비 값만 가져와서 재저장
                rows[0].price = JSON.parse(rows[0].price);
                rows[0].simple_info = JSON.parse(rows[0].simple_info);
                rows[0].location = JSON.parse(rows[0].location);
                rows[0].introduction = rows[0].introduction.replace(/\n/g, '<br/>'); // 설명부분 엔터적용되서 나오도록 변경

                resolve(rows[0]);
            });
        }).catch(error => {
            console.log(`roomDetail 에러 발생: ${error}`);
            logger.error(error);
            return false;
        });
    }

    // 숙소 후기 가져오기
    async getRoomReview(searchValue) {
        return new Promise((resolve) => {
            const sql = 'SELECT user_name, content, date FROM `review` WHERE room_id = ? ORDER BY id DESC LIMIT 5';
            connection.query(sql, searchValue, (err, rows) => {
                if (err) throw err;

                rows.forEach(val => {
                    val.date = moment(val.date).format('LL');
                });
                resolve(rows);
            });
        }).catch(error => {
            console.log(`roomReview 에러 발생: ${error}`);
            logger.error(error);
            return false;
        });
    }

    // 숙소 평점, 후기개수 가져오기
    async getRoomScoreCount(searchValue) {
        return new Promise(resolve => {
            const sql = 'SELECT COUNT(*) as count, SUM(score) as score FROM `review` WHERE room_id = ?';
            connection.query(sql, searchValue, (err, rows) => {
                if (err) throw err;

                rows.forEach(function (val) {
                    if (val.count === 0) {
                        val.score = 0;
                    } else {
                        val.score = (val.score / val.count).toFixed(1);
                    }
                });
                resolve(rows);
            });
        }).catch(error => {
            console.log(`roomScoreCount 에러 발생: ${error}`);
            logger.error(error);
            return false;
        });
    }

    // 결제페이지 정보 가져오기
    async getRoomPaymentDetail(searchValue) {
        return new Promise(resolve => {
            const sql = 'SELECT room.room_name AS name, room.simple_info, room.price, room.host_name, room_image.image_1  AS image, COUNT(review.room_id) AS count, SUM(review.score) AS score from `room` INNER JOIN `room_image` ON room.room_image_id = room_image.id LEFT JOIN review ON room.id = review.room_id WHERE room.id = ?';
            connection.query(sql, searchValue, (err, rows) => {
                if (err) throw err;

                logger.info('getRoomPaymentDetail 정보 %o', rows);
                // 하루 숙박비 값 파싱
                rows[0].simple_info = JSON.parse(rows[0].simple_info);
                rows[0].price = JSON.parse(rows[0].price);

                if (rows[0].count === 0) {
                    rows[0].score = 0;
                } else {
                    rows[0].score = (rows[0].score / rows[0].count).toFixed(1);
                }
                resolve(rows);
            });
        }).catch(error => {
            console.log(`getRoomPaymentDetail 에러 발생: ${error}`);
            logger.error(error);

            return false;
        });
    }

    // 위치정보얻기
    async getRoomLocation(data) {
        return new Promise((resolve) => {
            const sql = 'SELECT location FROM `room`  WHERE room_name=?';
            connection.query(sql, data.hotelName, (err, rows) => {
                if (err) throw err;

                const location = JSON.parse(rows[0].location);

                resolve(location);
            });
        }).catch(error => {
            console.log(`getLocation 에러 발생: ${error}`);
            logger.error(error);
            return false;
        });
    }
}