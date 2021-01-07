import connection from '../loaders/mysql';
import logger from '../loaders/logger';

//작성가능한 리뷰리스트 갸져오기
async function getWriteableReview(nickname) {
    return new Promise((resolve) => {
        const sql = 'SELECT booking.id, booking.item_name, booking.date, (SELECT image_1 FROM `room_image` WHERE room.room_image_id = room_image.id) AS image, room.id AS room_id FROM `booking` INNER JOIN `room` ON booking.item_name = room.room_name WHERE booking.partner_user_id = ? AND booking.id NOT IN (SELECT review.booking_id FROM `review` WHERE review.user_name = ?)';
        connection.query(sql, [nickname, nickname], (err, rows) => {
            if (err) throw err;
            resolve(rows);
        });
    }).catch(error => {
        console.log(`getWriteableReview 에러 발생: ${error}`);
        logger.error(error);

        return false;
    });
}

// 리뷰작성한 리스트가져오기
async function getWrittenReview(nickname) {
    return new Promise((resolve) => {
        // 유저가 숙박한적이있는지 확인 + 리뷰를 작성했는지 확인
        const sql = 'SELECT room_name, score, content FROM `review` WHERE user_name = ?';
        connection.query(sql, nickname, (err, rows) => {
            if (err) throw err;
            resolve(rows);
        });
    }).catch(error => {
        console.log(`getWrittenReview 에러 발생: ${error}`);
        logger.error(error);

        return false;
    });
}

async function getReview(roomId) {
    return new Promise((resolve) => {
        const sql = 'SELECT room.room_name, room.country, room_image.image_1 AS image FROM `room` INNER JOIN `room_image` ON room.room_image_id = room_image.id WHERE room.id = ?';
        connection.query(sql, roomId, (err, rows) => {
            if (err) throw err;
            resolve(rows);
        });
    }).catch(error => {
        console.log(`getReview 에러 발생: ${error}`);
        logger.error(error);
        return false;
    });
}

async function storeReview(review) {
    return new Promise((resolve) => {
        const sql = 'INSERT INTO `review` SET ?';
        connection.query(sql, review, (err) => {
            if (err) throw err;
            resolve(true);
        });
    }).catch(error => {
        console.log(`storeReview 에러 발생: ${error}`);
        logger.error(error);
        return false;
    });
}

export default {
    getWriteableReview, getWrittenReview, getReview, storeReview
};