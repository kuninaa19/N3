import db from '../loaders/mysql';
import logger from '../loaders/logger';

// 메인페이지 하단 숙소카드를 위한 숙소정보가져오기
async function getRecentRoomList() {
    return new Promise((resolve) => {
        db((err, connection) => {
            const sql =
                'SELECT room.id, room.room_name AS name, room.region, room_image.image_1 AS image FROM `room` INNER JOIN `room_image` ON room.room_image_id = room_image.id ORDER BY id DESC LIMIT 4';
            connection.query(sql, (err, rows) => {
                connection.release();
                if (err) throw err;
                resolve(rows);
            });
        });
    }).catch((error) => {
        console.log(`getRecentRoomList() 에러 발생: ${error}`);
        logger.error(error);
    });
}

// 검색한 지역 숙소정보 리스트 가져오기
async function getRoomList(searchPlace) {
    return new Promise((resolve) => {
        db((err, connection) => {
            const sql =
                'SELECT room.id, room.room_name AS name, room.region, room.price, (SELECT image_1 FROM `room_image` WHERE room.room_image_id = room_image.id) AS image, (SELECT COUNT(*) FROM `review` WHERE room.room_name = room_name) AS count, (SELECT SUM(score) FROM `review` WHERE room.room_name = room_name) AS score FROM `room` WHERE room.region = ?';
            connection.query(sql, searchPlace, (err, rows) => {
                connection.release();
                if (err) throw err;
                resolve(rows);
            });
        });
    }).catch((error) => {
        console.log(`getRoomList() 에러 발생: ${error}`);
        logger.error(error);
        return false;
    });
}

async function getRoomDetail(roomNum) {
    return new Promise((resolve) => {
        db((err, connection) => {
            const sql =
                'SELECT room.*, img.image_1, img.image_2, img.image_3, img.image_4, img.image_5 FROM `room` INNER JOIN `room_image` as img  ON room.room_image_id = img.id  WHERE room.id = ?';
            connection.query(sql, roomNum, (err, rows) => {
                connection.release();
                if (err) throw err;
                resolve(rows[0]);
            });
        });
    }).catch((error) => {
        console.log(`roomDetail 에러 발생: ${error}`);
        logger.error(error);
        return false;
    });
}

// 숙소 후기 가져오기
async function getRoomReview(roomNum) {
    return new Promise((resolve) => {
        db((err, connection) => {
            const sql = 'SELECT user_name, content, date FROM `review` WHERE room_id = ? ORDER BY id DESC LIMIT 5';
            connection.query(sql, roomNum, (err, rows) => {
                connection.release();
                if (err) throw err;
                resolve(rows);
            });
        });
    }).catch((error) => {
        console.log(`roomReview 에러 발생: ${error}`);
        logger.error(error);
        return false;
    });
}

// 숙소 평점, 후기개수 가져오기
async function getRoomScoreCount(roomNum) {
    return new Promise((resolve) => {
        db((err, connection) => {
            const sql = 'SELECT COUNT(*) as count, SUM(score) as score FROM `review` WHERE room_id = ?';
            connection.query(sql, roomNum, (err, rows) => {
                connection.release();
                if (err) throw err;
                resolve(rows);
            });
        });
    }).catch((error) => {
        console.log(`roomScoreCount 에러 발생: ${error}`);
        logger.error(error);
        return false;
    });
}

// 결제페이지 정보 가져오기
async function getRoomPaymentDetail(roomNum) {
    return new Promise((resolve) => {
        db((err, connection) => {
            const sql =
                'SELECT room.room_name AS name, room.simple_info, room.price, room.host_name, room_image.image_1  AS image, COUNT(review.room_id) AS count, SUM(review.score) AS score from `room` INNER JOIN `room_image` ON room.room_image_id = room_image.id LEFT JOIN review ON room.id = review.room_id WHERE room.id = ?';
            connection.query(sql, roomNum, (err, rows) => {
                connection.release();
                if (err) throw err;
                resolve(rows[0]);
            });
        });
    }).catch((error) => {
        console.log(`getRoomPaymentDetail 에러 발생: ${error}`);
        logger.error(error);

        return false;
    });
}

// 위치정보얻기
async function getLocation(roomName) {
    return new Promise((resolve) => {
        db((err, connection) => {
            const sql = 'SELECT location FROM `room` WHERE room_name = ?';
            connection.query(sql, roomName, (err, rows) => {
                connection.release();
                if (err) throw err;
                const location = JSON.parse(rows[0].location);
                resolve(location);
            });
        });
    }).catch((error) => {
        console.log(`getLocation 에러 발생: ${error}`);
        logger.error(error);
        return false;
    });
}

// 이미지 DB 저장
async function storeImg(images) {
    return new Promise((resolve) => {
        db((err, connection) => {
            const sql = 'INSERT INTO `room_image` SET ?';
            connection.query(sql, images, (err, row) => {
                connection.release();
                if (err) throw err;

                let resData = {
                    key: true,
                    roomImageId: row.insertId,
                };

                resolve(resData);
            });
        });
    }).catch((error) => {
        console.log(`storeImg 에러 발생: ${error}`);
        logger.error(error);

        const resData = {
            key: false,
        };
        return resData;
    });
}

//숙소정보DB 저장
async function storeRoom(room) {
    return new Promise((resolve) => {
        db((err, connection) => {
            const sql = 'INSERT INTO `room` SET ?';
            connection.query(sql, room, (err, row) => {
                connection.release();
                if (err) throw err;

                const resData = {
                    key: true,
                    roomNum: row.insertId,
                };

                resolve(resData);
            });
        });
    }).catch((error) => {
        console.log(`storeRoom 에러 발생: ${error}`);
        logger.error(error);

        const resData = {
            key: false,
        };
        return resData;
    });
}

export default {
    getRecentRoomList,
    getRoomList,
    getRoomDetail,
    getRoomReview,
    getRoomScoreCount,
    getRoomPaymentDetail,
    getLocation,
    storeImg,
    storeRoom,
};
