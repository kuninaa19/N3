import express from 'express';
import connection from '../../conf/dbInfo';
import moment from "moment";

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

//방 세부페이지 로그인확인
const checkIsAuthenticated = (req, res, next) => {
    //인증허가됨
    if (req.isAuthenticated()) {
        next();
    } else {
        const searchValue = req.params.number; // 호텔 번호

        roomInfo("guest", searchValue, res);
    }
};

// 방 세부페이지정보 가져오기
const roomDetail = (nickname, searchValue) => {
    return new Promise((resolve, reject) => {
        // 숙소정보 가져옴
        const sql = 'SELECT * FROM `room` as a INNER JOIN `images` as b ON a.image = b.image_1  WHERE a.id = ?';
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
        const sql = 'SELECT b.* FROM `room` as a INNER JOIN  `review` as b ON a.name = b.room_name WHERE a.name = ?';
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

//방 세부 페이지 (쿼리스트링 지역이름 + 호텔방 이름)
router.get('/:number', checkIsAuthenticated, async (req, res) => {
    const nickname = req.user.nickname; // 유저 아이디
    const searchValue = req.params.number; // 호텔 번호

    const detail = await roomDetail(nickname, searchValue);
    const roomName = detail.name;
    const review = await roomReview(roomName);

    if (nickname === "guest") {
        res.render('room/detail', {'roomsInfo': detail, 'roomsReview': review});
    } else {
        res.render('room/detail', {'roomsInfo': detail, 'roomsReview': review, 'nickname': nickname});
    }
});

//방 확인 및 결제 페이지
router.get('/:number/reservation/payment', checkAuth, (req, res) => {
    const searchValue = req.params.number; // 호텔 번호

    const formData = {
        // 'checkIn': req.query.checkin,
        // 'checkOut': req.query.checkout,
        'day': req.query.day,
        'perDayFee': ""
    };

    const sql = 'SELECT `id`,`name`,`region`,`simple_info`,`value`,`image`,`host_name` FROM `room` WHERE id = ?';
    connection.query(sql, searchValue, (err, row) => {
        if (err) throw  err;

        // 하루 숙박비 값만 가져와서 재저장
        row[0].simple_info = JSON.parse(row[0].simple_info);
        row[0].value = JSON.parse(row[0].value);

        // 날짜가 적용된 숙박요금(청소비 제외)
        formData.perDayFee = row[0].value.perDay * formData.day;

        res.render('room/reservation', {'rooms': row, 'reservationInfo': formData});
    });
});

export default router;
