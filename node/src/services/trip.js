import connection from "../loaders/mysql";
import logger from "../loaders/logger";
import moment from "moment";

export default class TripService {
    constructor() {
    }

    // 유저의 숙소 예약 내역 가져오기
    async getUserReservation(nickname) {
        return new Promise((resolve) => {
            const sql = 'SELECT booking.id, booking.aid, booking.item_name, booking.date, room.region, (SELECT image_1 FROM room_image WHERE room.room_image_id = room_image.id) AS image FROM `booking` INNER JOIN `room` WHERE booking.partner_user_id = ? AND booking.item_name = room.room_name ORDER BY booking.id DESC';
            connection.query(sql, nickname, (err, rows) => {
                if (err) throw err;

                // 숙박 날짜만 가져와서 재저장
                rows.forEach(function (val) {
                    val.date = JSON.parse(val.date);

                    // 년,월,일 한글 변환 적용
                    val.date.startDay = moment(val.date.startDay).format("LL");
                    val.date.endDay = moment(val.date.endDay).format("LL");
                });

                resolve(rows);
            });
        }).catch((error) => {
            console.log(`searchTripInfo 에러 발생: ${error}`);
            logger.error(error);

            const resData = {
                key: false,
            };
            return resData;
        });
    }

    // 유저 특정 예약 숙소 정보 가져오기
    async getUserReservationDetail(searchValue) {
        return new Promise((resolve) => {
            const sql = 'SELECT booking.date, booking.tid, booking.amount, booking.id AS message_id,  room.room_name AS name, room.id AS room_id, (SELECT image_1 FROM room_image WHERE room.room_image_id = room_image.id) AS image FROM `booking` INNER JOIN `room` WHERE booking.aid = ? AND booking.item_name = room.room_name';
            connection.query(sql, [searchValue], (err, rows) => {
                if (err) throw err;

                // 숙박 날짜만 가져와서 재저장
                rows.forEach(function (val) {
                    // 가격관련 JSON 파싱
                    val.amount = JSON.parse(val.amount);

                    // 날짜 JSON 파싱
                    val.date = JSON.parse(val.date);

                    val.reservedDay = moment(val.date.startDay).format("YYYY/MM/DD");

                    // 년,월,일 한글 변환 적용
                    val.date.startDay = moment(val.date.startDay).format("MMM Do (dd)");
                    val.date.endDay = moment(val.date.endDay).format("MMM Do (dd)");
                });

                resolve(rows);
            });
        }).catch((error) => {
            console.log(`getUserReservationDetail 에러 발생: ${error}`);
            logger.error(error);

            const resData = {
                key: false,
            };
            return resData;
        });
    }
}