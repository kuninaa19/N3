import connection from '../loaders/mysql';
import logger from '../loaders/logger';

export default class UploadService {
    constructor() {
    }

    // 이미지 DB 저장
    async storeImages(images) {
        return new Promise((resolve) => {
            const sql = 'INSERT INTO `room_image` SET ?';
            connection.query(sql, images, (err, row) => {
                if (err) throw err;

                let resData = {
                    'key': true,
                    'roomImageId': row.insertId
                };

                resolve(resData);
            });
        }).catch(error => {
            console.log(`storeImages 에러 발생: ${error}`);
            logger.error(error);

            const resData = {
                'key': false
            };
            return resData;
        });
    }

    //숙소정보DB 저장
    async storeRoom(room) {
        return new Promise((resolve) => {
            const sql = 'INSERT INTO `room` SET ?';
            connection.query(sql, room, (err, row) => {
                if (err) throw err;

                const resData = {
                    'key': true,
                    'roomNum': row.insertId
                };

                resolve(resData);
            });
        }).catch(error => {
            console.log(`storeRoom 에러 발생: ${error}`);
            logger.error(error);

            const resData = {
                'key': false
            };
            return resData;
        });
    }
}