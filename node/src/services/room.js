import connection from '../loaders/mysql';
import logger from '../loaders/logger';
import moment from "moment";

export default class RoomService {
    constructor() {
    }

    async index() {
        // 메인페이지 하단 숙소카드를 위한 숙소정보가져오기
        return new Promise((resolve) => {
            const sql = 'SELECT id,image,name,region FROM `room` ORDER BY id DESC LIMIT 4';
            connection.query(sql, (err, rows) => {
                if (err) throw err;
                resolve(rows);
            });
        }).catch(error => {
            console.log(`index 에러 발생: ${error}`);
            logger.error(error);
        });
    }

    // 검색한 지역 숙소정보 리스트 가져오기
    async getRoomList(searchValue) {
        return new Promise((resolve) => {
            const sql = 'SELECT a.id,a.name,a.region,a.value,a.image,(SELECT COUNT(*) FROM `review` WHERE a.name = room_name) as count,(SELECT SUM(score) FROM `review` WHERE a.name = room_name) as score FROM `room` as a  WHERE a.region = ?';
            connection.query(sql, searchValue, (err, rows) => {
                if (err) throw err;

                // 하루 숙박비 값만 가져와서 재저장, 평점 재저장
                rows.forEach(function (val) {
                    val.value = JSON.parse(val.value).perDay;
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
    async roomDetail(searchValue) {
        return new Promise((resolve) => {
            // 숙소정보 가져옴
            const sql = 'SELECT a.*, b.image_1, b.image_2, b.image_3, b.image_4, b.image_5 FROM `room` as a INNER JOIN `images` as b ON a.image = b.image_1  WHERE a.id = ?';
            connection.query(sql, searchValue, (err, rows) => {
                if (err) throw err;

                // 하루 숙박비 값만 가져와서 재저장
                rows[0].value = JSON.parse(rows[0].value);
                rows[0].simple_info = JSON.parse(rows[0].simple_info);
                rows[0].location = JSON.parse(rows[0].location);
                rows[0].intro_info = rows[0].intro_info.replace(/\n/g, '<br/>'); // 설명부분 엔터적용되서 나오도록 변경

                resolve(rows[0]);
            });
        }).catch(error => {
            console.log(`roomDetail 에러 발생: ${error}`);
            logger.error(error);
            return false;
        });
    }

    // 숙소 후기 가져오기
    async roomReview(searchValue) {
        return new Promise((resolve) => {
            const sql = 'SELECT room_name,user_name,content,date FROM `review` WHERE room_id = ? ORDER BY id DESC LIMIT 5';
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
    async roomScoreCount(searchValue) {
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
    async roomPaymentDetail(searchValue) {
        return new Promise(resolve => {
            const sql = 'SELECT a.name,a.simple_info,a.location,a.value,a.image,a.host_name,COUNT(b.room_id) as count, SUM(b.score) as score FROM `room` as a INNER JOIN `review` as b ON a.id = b.room_id WHERE a.id = ?';
            connection.query(sql, searchValue, (err, rows) => {
                if (err) throw err;

                // 하루 숙박비 값 파싱
                rows[0].simple_info = JSON.parse(rows[0].simple_info);
                rows[0].value = JSON.parse(rows[0].value);

                if (rows[0].count === 0) {
                    rows[0].score = 0;
                } else {
                    rows[0].score = (rows[0].score / rows[0].count).toFixed(1);
                }
                resolve(rows);
            });
        }).catch(error => {
            console.log(`roomPaymentDetail 에러 발생: ${error}`);
            logger.error(error);

            return false;
        });
    }

    // 위치정보얻기
    async getLocation(data) {
        return new Promise((resolve) => {
            const sql = 'select location from room  WHERE name=?';
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