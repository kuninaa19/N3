import express from 'express';
import connection from '../../conf/dbInfo';
import checkToken from "./token_module";
import moment from "moment";

const router = express.Router();

const checkAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }

    res.send("<script>alert('접속할 수 없는 페이지 입니다.'); history.go(-1);</script>");
};

const getAvailableReviewList = (nickname) => {
    return new Promise((resolve, reject) => {
        // 유저가 숙박한적이있는지 확인 + 리뷰를 작성했는지 확인
        const sql = 'SELECT a.id, a.item_name, a.date,b.image, b.id as room_id FROM `order` as `a` INNER JOIN `room` as `b` ON a.item_name = b.name WHERE a.partner_user_id = ? AND a.id NOT IN (SELECT c.order_id FROM `review` as `c` WHERE c.user_name = ?)';
        connection.query(sql, [nickname,nickname], (err, row) => {
            if (err) throw  err;

            // 숙박 날짜만 가져와서 재저장
            row.forEach(function (val) {
                val.date = JSON.parse(val.date);

                // 년,월,일 한글 변환 적용
                val.date.startDay = moment(val.date.startDay).format('LL');
                val.date.endDay = moment(val.date.endDay).format('LL');
            });
            resolve(row);
        });
    });
};

router.get('/', checkAuth, async (req, res) => {
    const nickname = req.user.nickname;

    await checkToken(req, res);

    const reviewInfo = await getAvailableReviewList(nickname);

    res.render('user/info/info_index', {'nickname': nickname, 'reviewList': reviewInfo});
});

router.get('/review', checkAuth, async (req, res) => {
    const nickname = req.user.nickname;

    await checkToken(req, res);


    res.render('user/info/info_review', {'nickname': nickname});
});

export default router;
