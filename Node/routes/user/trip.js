import express from 'express';
import connection from '../../conf/dbInfo';
import moment from 'moment';
import timezone from 'moment-timezone';
import checkToken from './token_module'; // 토큰 검증,재발급 관련 메서드

moment.tz.setDefault("Asia/Seoul");

const router = express.Router();

const checkAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.send("<script>alert('로그인후 접속 가능합니다.'); history.go(-1);</script>");
};

const searchTripInfo = (nickname, res)=>{
    //숙소 예약 정보가져옴 날짜순으로 정렬해야할지 구매순으로 정렬해야할지 생각
    const sql = 'select a.id, a.aid, a.item_name, a.date, b.region, b.image from `order` AS `a` INNER JOIN `room` AS `b` WHERE a.partner_user_id = ? AND a.item_name = b.name GROUP BY a.id ORDER BY a.id DESC';
    connection.query(sql, nickname, (err, row) => {
        if (err) throw  err;

        // 숙박 날짜만 가져와서 재저장
        row.forEach(function (val) {
            val.date = JSON.parse(val.date);

            // 년,월,일 한글 변환 적용
            val.date.startDay = moment(val.date.startDay).format('LL');
            val.date.endDay = moment(val.date.endDay).format('LL');
        });

        res.render('user/trip/trip_index', {'nickname': nickname, 'rooms': row});
    });
};

router.get('/', checkAuth, async (req, res) => {
    const nickname = req.user.nickname;

    await checkToken(req,res);

    searchTripInfo(nickname,res);
});

router.get('/:aid', checkAuth, (req, res) => {
    const nickname = req.user.nickname;
    const searchValue = req.params.aid;

    const sql = 'select a.date, a.tid, a.amount, a.id AS message_id, b.location,b.name,b.id AS room_id, b.image from `order` AS `a` INNER JOIN `room` AS `b` WHERE a.aid = ? AND a.item_name = b.name';
    connection.query(sql, [searchValue], (err, row) => {
        if (err) throw  err;

        // 숙박 날짜만 가져와서 재저장
        row.forEach(function (val) {
            // 가격관련 JSON 파싱
            val.amount = JSON.parse(val.amount);

            // 날짜 JSON 파싱
            val.date = JSON.parse(val.date);

            // 장소 위,경도 값 JSON 파싱
            val.location = JSON.parse(val.location);

            val.reservedDay = moment(val.date.startDay).format('YYYY/MM/DD');

            // 년,월,일 한글 변환 적용
            val.date.startDay = moment(val.date.startDay).format('MMM Do (dd)');
            val.date.endDay = moment(val.date.endDay).format('MMM Do (dd)');

        });

        res.render('user/trip/trip_detail', {'nickname': nickname, 'roomInfo': row});
    });
});

export default router;
