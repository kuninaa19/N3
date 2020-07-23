import express from 'express';
import connection from '../../conf/dbInfo';
import checkToken from "./token_module";
import moment from "moment";
import moment_timezone from 'moment-timezone';

moment.tz.setDefault("Asia/Seoul");

const router = express.Router();

const checkAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }

    res.send("<script>alert('접속할 수 없는 페이지 입니다.'); history.go(-1);</script>");
};

//작성가능한 리뷰리스트 갸져오기
const getAvailableReviewList = (nickname) => {
    return new Promise((resolve, reject) => {
        // 유저가 숙박한적이있는지 확인 + 리뷰를 작성했는지 확인
        const sql = 'SELECT a.id, a.item_name, a.date,b.image, b.id as room_id FROM `order` as `a` INNER JOIN `room` as `b` ON a.item_name = b.name WHERE a.partner_user_id = ? AND a.id NOT IN (SELECT c.order_id FROM `review` as `c` WHERE c.user_name = ?)';
        connection.query(sql, [nickname, nickname], (err, row) => {
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

// 리뷰작성한 리스트가져오기
const getReviewList = (nickname) => {
    return new Promise((resolve, reject) => {
        // 유저가 숙박한적이있는지 확인 + 리뷰를 작성했는지 확인
        const sql = 'SELECT room_name,score,content FROM `review` WHERE user_name = ?';
        connection.query(sql, nickname, (err, row) => {
            if (err) throw  err;

            resolve(row);
        });
    });
};

// 작성할 숙소리뷰정보에 대해 가져오기
const getRoomInfo = (roomId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT image,name,country FROM `room` WHERE id = ?';
        connection.query(sql, roomId, (err, row) => {
            if (err) throw  err;

            resolve(row);
        });
    })
};

// 작성된 리뷰 저장
const storeReview = (data) => {
    return new Promise((resolve, reject) => {
        const sql = 'insert into `review` set ?';
        connection.query(sql, data, (err, row) => {
            if (err) throw  err;

            resolve(true);
        });
    }).catch(error => {
        console.log(`storeReview 에러 발생: ${error}`);
        return false;
    });
};

//내정보 메인페이지
router.get('/', checkAuth, async (req, res) => {
    await checkToken(req, res);

    const nickname = req.user.nickname;
    const reviewInfo = await getAvailableReviewList(nickname);

    res.render('user/info/info_index', {'nickname': nickname, 'reviewList': reviewInfo});
});

// 내정보 작성했던 리뷰 목록 페이지
router.get('/review', checkAuth, async (req, res) => {
    await checkToken(req, res);

    const nickname = req.user.nickname;
    const reviewInfo = await getReviewList(nickname);

    res.render('user/info/info_review', {'nickname': nickname, 'reviewList': reviewInfo});
});

// 리뷰작성페이지
router.post('/review/writing', checkAuth, async (req, res) => {
    await checkToken(req, res);

    const nickname = req.user.nickname;
    const roomId = req.body.room;
    const orderId = req.body.order;

    const roomInfo = await getRoomInfo(roomId);

    res.render('user/info/info_review_writing', {
        'nickname': nickname,
        'roomInfo': roomInfo,
        'orderId': orderId,
        'roomId': roomId
    });
});

// 작성된 리뷰 저장
router.post('/review/storage', async (req, res) => {
    await checkToken(req, res);

    const reviewData = req.body;
    reviewData.user_name = req.user.nickname;
    reviewData.date = moment().format('YYYY-MM-DD HH:mm:ss');

    const result = await storeReview(reviewData);

    res.json({key: result});
});

export default router;
