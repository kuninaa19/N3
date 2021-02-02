import db from '../loaders/mysql';
import logger from '../loaders/logger';
import moment from 'moment';

// 메시지,채팅 DB 저장
async function storeMsg(bookingId, user, session) {
    const time = moment().format('YYYY-MM-DD HH:mm:ss');

    const storeChatWindow = new Promise((resolve) => {
        const chat_window = {
            room_id: bookingId,
            user_name: user,
            host_name: session.host_name,
            message: session.message,
            time: time,
        };
        db((err, connection) => {
            const sql = 'INSERT INTO `chat_window` SET ?';
            connection.query(sql, chat_window, (err) => {
                connection.release();
                if (err) throw err;
                resolve(true);
            });
        });
    }).catch((error) => {
        console.log(`storeMsg 에러 발생: ${error}`);
        logger.error(error);
    });

    const storeChat = new Promise((resolve) => {
        const chat = {
            room_id: bookingId,
            sender: user,
            content: session.message,
            time: time,
        };
        db((err, connection) => {
            const sql = 'INSERT INTO `chat` SET ?';
            connection.query(sql, chat, (err) => {
                connection.release();
                if (err) throw err;
                resolve(true);
            });
        });
    }).catch((error) => {
        console.log(`storeChat 에러 발생: ${error}`);
        logger.error(error);
    });
    Promise.all([storeChatWindow, storeChat]).then((values) => {
        if (values[0] === values[1]) {
            logger.info('promiseAll Done');
        }
    });
}

//메시지 전달
async function getMsg(nickname) {
    return new Promise((resolve) => {
        db((err, connection) => {
            const sql =
                'SELECT chat_window.*, booking.date, booking.item_name, room.country, room.region FROM `chat_window` INNER JOIN `booking` INNER JOIN `room` ON chat_window.user_name = ? OR chat_window.host_name = ? WHERE chat_window.room_id = booking.id AND booking.item_name = room.room_name ORDER BY chat_window.time DESC';
            connection.query(sql, [nickname, nickname], (err, rows) => {
                connection.release();
                if (err) throw err;
                resolve(rows);
            });
        });
    }).catch((error) => {
        console.log(`getMsg 에러 발생: ${error}`);
        logger.error(error);
    });
}

// 채팅창(메시지 상세페이지)
async function getMsgDetail(msgId, nickname) {
    return new Promise((resolve) => {
        db((err, connection) => {
            const sql =
                'SELECT chat_window.user_name, chat_window.host_name, chat.* FROM `chat_window` INNER JOIN `chat` ON chat_window.room_id=chat.room_id WHERE chat.room_id=? AND (chat_window.user_name=? OR chat_window.host_name=?) ORDER BY chat.id asc';
            connection.query(sql, [msgId, nickname, nickname], (err, rows) => {
                connection.release();
                if (err) throw err;
                resolve(rows);
            });
        });
    }).catch((error) => {
        console.log(`getMsgDetail 에러 발생: ${error}`);
        logger.error(error);
    });
}

// 언어감지된 값 저장
async function updateLang(resPapago, chat) {
    // 멤버로 키를 가지고 있는지 확인
    if ('key' in chat) {
        return new Promise((resolve) => {
            db((err, connection) => {
                const sql = 'UPDATE chat SET lang = ? WHERE room_id = ?';
                connection.query(sql, [resPapago.langCode, chat.room_id], (err) => {
                    connection.release();
                    if (err) throw err;
                });
                resolve({key: chat.key});
            });
        }).catch((error) => {
            console.log(`storeLang if문 에러 발생: ${error}`);
            logger.error(error);
        });
    } else {
        return new Promise((resolve) => {
            db((err, connection) => {
                const sql = 'UPDATE chat SET lang = ? WHERE room_id = ? AND id = ?';
                connection.query(sql, [resPapago.langCode, chat.room_id, chat.item_id], (err) => {
                    connection.release();
                    if (err) throw err;
                });
                resolve(resPapago);
            });
        }).catch((error) => {
            console.log(`storeLang else문 에러 발생: ${error}`);
            logger.error(error);
        });
    }
}

export default {
    storeMsg,
    getMsg,
    getMsgDetail,
    updateLang,
};
