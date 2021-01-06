import moment from 'moment';
import connection from '../loaders/mysql';
import logger from '../loaders/logger';

// 시간 45분 -> 60분 일 22시간 -> 24시간
moment.relativeTimeThreshold('m', 60);
moment.relativeTimeThreshold('h', 24);
moment.relativeTimeThreshold('M', 30);

moment.updateLocale('ko', {
    relativeTime: {
        future: "%s 후",
        past: "%s 전",
        s: "%d 초",
        ss: "%d 초",
        m: "%d 분",
        mm: "%d 분",
        h: "%d 시간",
        hh: "%d 시간",
        d: "%d 일",
        dd: "%d 일",
        M: "%d 달",
        MM: "%d 달",
        y: "%d 년",
        yy: "%d 년"
    }
});

export default class MessageService {
    constructor() {
    }

    //메시지 전달
    async getMessages(nickname) {
        return new Promise((resolve) => {
            const sql = 'SELECT chat_window.*, booking.date, booking.item_name, room.country, room.region FROM `chat_window` INNER JOIN `booking` INNER JOIN `room` ON chat_window.user_name = ? OR chat_window.host_name = ? WHERE chat_window.room_id = booking.id AND booking.item_name = room.room_name ORDER BY chat_window.time DESC';
            connection.query(sql, [nickname, nickname], (err, rows) => {
                if (err) throw err;

                // 대화하는 상대방 아이디
                let opponent = [];

                for (let i = 0; i < rows.length; i++) {
                    // 숙박날짜 JSON 파싱
                    rows[i].date = JSON.parse(rows[i].date);

                    // 년,월,일 한글 변환 적용
                    rows[i].date.startDay = moment(rows[i].date.startDay).format('LL');
                    rows[i].date.endDay = moment(rows[i].date.endDay).format('LL');
                    rows[i].time = moment(rows[i].time).fromNow();

                    // 접속자가 집주인이면 방문객 이름, 접속자가 방문객이면
                    // 집주인 이름
                    if (rows[i].host_name === nickname) {
                        opponent[i] = rows[i].user_name;
                    } else {
                        opponent[i] = rows[i].host_name;
                    }
                }
                resolve({rows, opponent});
            });

        }).catch(error => {
            console.log(`getMessages 에러 발생: ${error}`);
            logger.error(error);

            const resData = {
                'key': false
            };
            return resData;
        });
    }

    // 채팅창(메시지 상세페이지)
    async getMessagesDetail(searchValue, nickname) {
        return new Promise((resolve) => {
            const sql = 'SELECT chat_window.user_name, chat_window.host_name, chat.* FROM `chat_window` INNER JOIN `chat` ON chat_window.room_id=chat.room_id WHERE chat.room_id=? AND (chat_window.user_name=? OR chat_window.host_name=?) ORDER BY chat.id asc';
            connection.query(sql, [searchValue, nickname, nickname], (err, rows) => {
                if (err) throw err;

                if (rows.length === 0) {
                    // res.send("<script>alert('접속할 수 없는 페이지 입니다.'); history.go(-1);</script>");
                } else {
                    // 대화하는 상대방 아이디
                    let opponent;

                    if (rows[0].host_name === nickname) {
                        opponent = rows[0].user_name;
                    } else {
                        opponent = rows[0].host_name;
                    }

                    // 날짜만 가져오기위한 배열
                    let LLTime = [];

                    for (let i = 0; i < rows.length; i++) {
                        // 날짜만 가져오기
                        LLTime[i] = moment(rows[i].time).format('LL');

                        // 년,월,일 한글 변환 적용
                        rows[i].time = moment(rows[i].time).format('LT');
                    }
                    resolve({rows, LLTime, opponent});
                }

            });

        }).catch(error => {
            console.log(`getMessagesDetail 에러 발생: ${error}`);
            logger.error(error);

            const resData = {
                'key': false
            };
            return resData;
        });
    }
}