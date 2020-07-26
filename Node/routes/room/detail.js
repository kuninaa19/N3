import express from 'express';
import connection from '../../conf/dbInfo';
import moment from "moment";
import asyncHandler from "express-async-handler";

const router = express.Router();

//방 결제페이지 인증확인
const checkAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    // const params = req.params.number;
    // const url = '/rooms/' + params;
    res.send(`<script>  alert('로그인후 결제가능합니다'); history.go(-1);</script>`);
};

// 방 세부페이지정보 가져오기
const roomDetail = (searchValue) => {
    return new Promise((resolve, reject) => {
        // 숙소정보 가져옴
        const sql = 'SELECT a.*, b.image_1, b.image_2, b.image_3, b.image_4, b.image_5 FROM `room` as a INNER JOIN `images` as b ON a.image = b.image_1  WHERE a.id = ?';
        connection.query(sql, searchValue, (err, row) => {
            if (err) throw  err;

            // 하루 숙박비 값만 가져와서 재저장
            row[0].value = JSON.parse(row[0].value);
            row[0].simple_info = JSON.parse(row[0].simple_info);
            row[0].location = JSON.parse(row[0].location);
            row[0].intro_info = row[0].intro_info.replace(/\n/g, '<br/>'); // 설명부분 엔터적용되서 나오도록 변경

            resolve(row[0]);
        });
    }).catch(error => {
        console.log(`roomInfo 에러 발생: ${error}`);
        return false;
    });
};

// 숙소 후기 가져오기
const roomReview = (searchValue) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT room_name,user_name,content,date FROM `review` WHERE room_id = ? ORDER BY id DESC LIMIT 5';
        connection.query(sql, searchValue, (err, row) => {
            if (err) throw  err;

            row.forEach(val => {
                val.date = moment(val.date).format('LL');
            });
            resolve(row);
        });
    }).catch(error => {
        console.log(`roomInfo 에러 발생: ${error}`);
        return false;
    });
};

// 숙소 평점, 후기개수 가져오기
const roomScoreCount = (searchValue) => {
    return new Promise(resolve => {
        const sql = 'SELECT COUNT(*) as count, SUM(score) as score FROM `review` WHERE room_id = ?';
        connection.query(sql, searchValue, (err, row) => {
            if (err) throw  err;

            row.forEach(function (val) {
                if (val.count === 0) {
                    val.score = 0;
                } else {
                    val.score = (val.score / val.count).toFixed(1);
                }
            });
            resolve(row);
        });
    }).catch(error => {
        console.log(`roomScore 에러 발생: ${error}`);
        return false;
    });
};

// 결제페이지 정보 가져오기
const roomPaymentDetail = (searchValue) => {
    return new Promise(resolve => {
        const sql = 'SELECT a.name,a.simple_info,a.location,a.value,a.image,a.host_name,COUNT(b.room_id) as count, SUM(b.score) as score FROM `room` as a INNER JOIN `review` as b ON a.id = b.room_id WHERE a.id = ?';
        connection.query(sql, searchValue, (err, row) => {
            if (err) throw  err;

            // 하루 숙박비 값 파싱
            row[0].simple_info = JSON.parse(row[0].simple_info);
            row[0].value = JSON.parse(row[0].value);

            if (row[0].count === 0) {
                row[0].score = 0;
            } else {
                row[0].score = (row[0].score / row[0].count).toFixed(1);
            }
            resolve(row);
        });
    }).catch(error => {
        console.log(`roomPayment 에러 발생: ${error}`);
        return false;
    });

};

//방 세부 페이지 (쿼리스트링 지역이름 + 호텔방 이름)
router.get('/:number', asyncHandler(async (req, res) => {
    const searchValue = req.params.number; // 호텔 번호

    const detail = await roomDetail(searchValue);
    const review = await roomReview(searchValue);
    const scoreCount = await roomScoreCount(searchValue);

    if (req.isAuthenticated()) {
        const nickname = req.user.nickname; // 유저 아이디

        res.render('room/detail', {
            'roomsInfo': detail,
            'roomsReview': review,
            'nickname': nickname,
            'scoreCount': scoreCount
        });
    } else {
        res.render('room/detail', {'roomsInfo': detail, 'roomsReview': review, 'scoreCount': scoreCount});
    }
}));

//방 확인 및 결제 페이지
router.get('/:number/reservation/payment', checkAuth, asyncHandler(async (req, res) => {
    const searchValue = req.params.number; // 호텔 번호

    const paymentDetail = await roomPaymentDetail(searchValue);

    const formData = {
        // 날짜가 적용된 숙박요금(청소비 제외)
        'perDayFee': paymentDetail[0].value.perDay * req.query.day,
        'day': req.query.day
    };

    res.render('room/reservation', {'rooms': paymentDetail, 'reservationInfo': formData});
}));

export default router;
