import express from 'express';
import connection from '../../conf/dbInfo';
import moment from 'moment';
import timezone from 'moment-timezone';
moment.tz.setDefault("Asia/Seoul");

const router = express.Router();

const checkAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.send("<script>alert('로그인후 접속 가능합니다.'); history.go(-1);</script>");
};

router.get('/', checkAuth, (req, res) => {
    const nickname = req.user.nickname;

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

        res.render('user/trip/index', {'nickname': nickname, 'rooms': row});
    });
});

router.get('/:aid', checkAuth, (req, res) => {

    res.render('user/trip/detail', {'nickname': nickname, 'rooms': row});
});

export default router;
