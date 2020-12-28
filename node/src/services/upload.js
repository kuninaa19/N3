import connection from '../loaders/mysql';
import logger from '../loaders/logger';

export default class UploadService {
    constructor() {
    }

    // 이미지 DB 저장
    async insertImages(images) {
        return new Promise((resolve) => {
            const sql = 'INSERT INTO `images` SET ?';
            connection.query(sql, images, (err) => {
                if (err) throw err;

                let resData = {
                    'key': true,
                    'image': images.image_1
                };

                resolve(resData);
            });
        }).catch(error => {
            logger.error(`insertImage 에러 발생: ${error}`);
            console.log(`insertImage 에러 발생: ${error}`);

            const resData = {
                'key': false
            };
            return resData;
        });
    }

    //숙소정보DB 저장
    async insertRoomInfo(room) {
        return new Promise((resolve) => {
            const sql = 'INSERT INTO `room` SET ?';
            connection.query(sql, room, (err, rows) => {
                if (err) throw err;

                const resData = {
                    'key': true,
                    'roomNum': rows.insertId
                };

                resolve(resData);
            });
        }).catch(error => {
            console.log(`insertRoomInfo 에러 발생: ${error}`);
            logger.error(error);

            const resData = {
                'key': false
            };
            return resData;
        });
    }
}