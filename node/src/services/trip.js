import connection from "../loaders/mysql";
import logger from "../loaders/logger";
import moment from "moment";
import timezone from "moment-timezone";

moment.tz.setDefault("Asia/Seoul");

export default class TripService {
    constructor() {
    }

    // 유저의 숙소 예약 내역 가져오기
    async searchTripInfo(nickname) {
        return new Promise((resolve) => {
            //숙소 예약 정보가져옴 날짜순으로 정렬해야할지 구매순으로 정렬해야할지 생각
            const sql =
                "select a.id, a.aid, a.item_name, a.date, b.region, b.image from `orders` AS `a` INNER JOIN `room` AS `b` WHERE a.partner_user_id = ? AND a.item_name = b.name GROUP BY a.id ORDER BY a.id DESC";
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
    async searchTripDetail(searchValue) {
        return new Promise((resolve) => {
            const sql =
                "select a.date, a.tid, a.amount, a.id AS message_id, b.location,b.name,b.id AS room_id, b.image from `orders` AS `a` INNER JOIN `room` AS `b` WHERE a.aid = ? AND a.item_name = b.name";
            connection.query(sql, [searchValue], (err, rows) => {
                if (err) throw err;

                // 숙박 날짜만 가져와서 재저장
                rows.forEach(function (val) {
                    // 가격관련 JSON 파싱
                    val.amount = JSON.parse(val.amount);

                    // 날짜 JSON 파싱
                    val.date = JSON.parse(val.date);

                    // 장소 위,경도 값 JSON 파싱
                    val.location = JSON.parse(val.location);

                    val.reservedDay = moment(val.date.startDay).format("YYYY/MM/DD");

                    // 년,월,일 한글 변환 적용
                    val.date.startDay = moment(val.date.startDay).format("MMM Do (dd)");
                    val.date.endDay = moment(val.date.endDay).format("MMM Do (dd)");
                });

                resolve(rows);
            });
        }).catch((error) => {
            console.log(`searchTripDetail 에러 발생: ${error}`);
            logger.error(error);

            const resData = {
                key: false,
            };
            return resData;
        });
    }
}
