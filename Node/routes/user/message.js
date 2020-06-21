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
    const sql = 'select  a.* ,b.aid, b.date, b.item_name from `message` AS `a` INNER JOIN `order` AS `b` WHERE a.user_name = ? OR a.host_name = ?  GROUP BY a.time ORDER BY a.time DESC LIMIT 10';
    connection.query(sql, [nickname, nickname], (err, row) => {
        if (err) throw  err;

        console.log('1순위 시간', moment(row[0].time).subtract(9, 'hours'));
        console.log('LLLL 변환', moment(row[0].time).subtract(9, 'hours').format('LLLL'));
        console.log('현재시간', moment().format());

        // 숙박 날짜만 가져와서 재저장
        row.forEach((val) => {
            val.date = JSON.parse(val.date);

            // mysql에 저장된 시간에서 9시간을 빼고 비교해야 정확한 결과값이 나온다.

            val.time = moment(val.time).subtract(9, 'hours').fromNow();

            // relativeTime.push(moment(val.time).subtract(9, 'hours').fromNow());
            // // 접속자가 호스트라면
            // if(val.host_name===nickname){
            //
            // }
            // else{
            //
            // }
        });

        console.log('상대시간', moment('2020-06-19 19:57',"YYYY-MM-DD HH:mm").fromNow());


        res.render('user/message', {'nickname': nickname, 'message': row});
    });

});

export default router;
