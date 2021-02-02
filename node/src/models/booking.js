import db from '../loaders/mysql';
import logger from '../loaders/logger';

// 유저의 숙소 예약 내역 가져오기
async function getUserBooking(nickname) {
    return new Promise((resolve) => {
        db((err, connection) => {
            const sql =
                'SELECT booking.id, booking.aid, booking.item_name, booking.date, room.region, (SELECT image_1 FROM room_image WHERE room.room_image_id = room_image.id) AS image FROM `booking` INNER JOIN `room` WHERE booking.partner_user_id = ? AND booking.item_name = room.room_name ORDER BY booking.id DESC';
            connection.query(sql, nickname, (err, rows) => {
                connection.release();
                if (err) throw err;
                resolve(rows);
            });
        });
    }).catch((error) => {
        console.log(`getUserBooking 에러 발생: ${error}`);
        logger.error(error);
    });
}

// 유저 특정 예약 숙소 정보 가져오기
async function getUserBookingDetail(reservationId) {
    return new Promise((resolve) => {
        db((err, connection) => {
            const sql =
                'SELECT booking.date, booking.tid, booking.amount, booking.id AS message_id,  room.room_name AS name, room.id AS room_id, (SELECT image_1 FROM room_image WHERE room.room_image_id = room_image.id) AS image FROM `booking` INNER JOIN `room` WHERE booking.aid = ? AND booking.item_name = room.room_name';
            connection.query(sql, [reservationId], (err, rows) => {
                connection.release();
                if (err) throw err;
                resolve(rows);
            });
        });
    }).catch((error) => {
        console.log(`getUserReservationDetail 에러 발생: ${error}`);
        logger.error(error);
    });
}

//결제완료후 정보 DB 저장
async function storeBooking(reservation) {
    return new Promise((resolve) => {
        db((err, connection) => {
            const sql = 'INSERT INTO `booking` SET ?';
            connection.query(sql, reservation, (err, rows) => {
                connection.release();
                if (err) throw err;
                const storedId = rows.insertId;
                resolve(storedId);
            });
        });
    }).catch((error) => {
        console.log(`insertBooking 에러 발생: ${error}`);
        logger.error(error);
    });
}

// DB저장된 주문 정보 삭제
async function deleteBooking(reservation) {
    return new Promise((resolve) => {
        db((err, connection) => {
            const sql = 'DELETE FROM `booking` WHERE tid=? AND item_name=?';
            connection.query(sql, [reservation.tid, reservation.item_name], (err) => {
                connection.release();
                if (err) throw err;
                resolve();
            });
        });
    }).catch((error) => {
        console.log(`deleteBooking 에러 발생: ${error}`);
        logger.error(error);
    });
}

export default {
    getUserBooking,
    getUserBookingDetail,
    storeBooking,
    deleteBooking,
};
