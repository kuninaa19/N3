import express from 'express';
import connection from '../../conf/dbInfo';

const router = express.Router();

//방 결제페이지 인증확인
const checkAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    //모달창 열기로 변경해야됨
    const params = req.params.number;
    const url = '/rooms/' + params;
    res.redirect(url);
};

//방 세부페이지 로그인확인
const checkIsAuthenticated = (req, res, next) => {
    //인증허가됨
    if (req.isAuthenticated()) {
        next();
    }
    const searchValue = req.params.number; // 호텔 번호

    //방 정보 검색
    const sql = 'select * from `room` where id = ?';
    connection.query(sql, searchValue, (err, row) => {
        if (err) throw  err;

        // 하루 숙박비 값만 가져와서 재저장
        row[0].value = JSON.parse(row[0].value);
        row[0].simple_info = JSON.parse(row[0].simple_info);
        row[0].location = JSON.parse(row[0].location);
        row[0].intro_info = row[0].intro_info.replace(/\n/g, '<br/>'); // 설명부분 엔터적용되서 나오도록 변경

        const roomInfo = row[0];

        // 이미지 검색
        const sql = 'select * from `images` where image_1 = ?';
        connection.query(sql, row[0].image, (err, row) => {
            if (err) throw  err;

            res.render('room/detail', {'rooms': roomInfo, 'images': row});
        });
    });
};
//방 세부 페이지 (쿼리스트링 지역이름 + 호텔방 이름)
router.get('/:number', checkIsAuthenticated, (req, res) => {
    const nickname = req.user.nickname; // 유저 아이디
    const searchValue = req.params.number; // 호텔 번호

    const sql = 'select * from `room` where id = ?';
    connection.query(sql, searchValue, (err, row) => {
        if (err) throw  err;

        // 하루 숙박비 값만 가져와서 재저장
        row[0].value = JSON.parse(row[0].value);
        row[0].simple_info = JSON.parse(row[0].simple_info);
        row[0].location = JSON.parse(row[0].location);
        row[0].intro_info = row[0].intro_info.replace(/\n/g, '<br/>'); // 설명부분 엔터적용되서 나오도록 변경

        const roomInfo = row[0];

        // 이미지 검색
        const sql = 'select * from `images` where image_1 = ?';
        connection.query(sql, row[0].image, (err, row) => {
            if (err) throw  err;

            res.render('room/detail', {'rooms': roomInfo, 'images': row, 'nickname': nickname});
        });
    });
});

//방 확인 및 결제 페이지
// router.get('/:number/reservation/payment',checkAuth, (req, res)=> {
router.get('/:number/reservation/payment', (req, res) => {
    const searchValue = req.params.number; // 호텔 번호

    const formData = {
        // 'checkIn': req.query.checkin,
        // 'checkOut': req.query.checkout,
        'day': req.query.day,
        'perDayFee':""
    };

    const sql = 'select `id`,`name`,`region`,`simple_info`,`value`,`image` from `room` where id = ?';
    connection.query(sql, searchValue, (err, row) => {
        if (err) throw  err;

        // 하루 숙박비 값만 가져와서 재저장
        row[0].simple_info = JSON.parse(row[0].simple_info);
        row[0].value = JSON.parse(row[0].value);

        // 날짜가 적용된 숙박요금(청소비 제외)
        formData.perDayFee=row[0].value.perDay*formData.day;

        res.render('room/reservation', {'rooms': row, 'reservationInfo': formData});
    });
});

export default router;
