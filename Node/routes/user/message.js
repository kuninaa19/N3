import express from 'express';
import connection from '../../conf/dbInfo';

const router = express.Router();

// 시간관련 모듈
import moment from 'moment';

require('moment-timezone');
// import timezone from 'moment-timezone';
moment.tz.setDefault("Asia/Seoul");

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

const checkAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    //모달창 열기로 변경해야됨
};

// 유저 로그인했을때만 메시지페이지
router.get('/', checkAuth, (req, res) => {
    const nickname = req.user.nickname;

    //메시지 최초 10개 전달
    const sql = 'select  a.*, b.date, b.item_name,c.country,c.region from `message` AS `a` INNER JOIN `order` AS `b` INNER JOIN `room` AS `c` WHERE a.user_name = ? OR a.host_name = ? AND b.item_name = c.name  GROUP BY a.time ORDER BY a.time DESC LIMIT 10';
    connection.query(sql, [nickname, nickname], (err, row) => {
        if (err) throw  err;

        // 대화하는 상대방 아이디
        let opponent = [];

        for (let i = 0; i < row.length; i++) {
            // 숙박날짜 JSON 파싱
            row[i].date = JSON.parse(row[i].date);

            // 년,월,일 한글 변환 적용
            row[i].date.startDay = moment(row[i].date.startDay).format('LL');
            row[i].date.endDay = moment(row[i].date.endDay).format('LL');

            // mysql에 저장된 시간에서 9시간을 빼고 비교해야 정확한 결과값이 나온다.
            row[i].time = moment(row[i].time).subtract(9, 'hours').fromNow();

            // 접속자가 집주인이면 방문객 이름, 접속자가 방문객이면
            // 집주인 이름
            if (row[i].host_name === nickname) {
                opponent[i] = row[i].user_name;
            } else {
                opponent[i] = row[i].host_name;
            }
        }
        console.log(row);

        res.render('user/message', {'nickname': nickname, 'message': row, 'opponent': opponent});
    });
});

export default router;
