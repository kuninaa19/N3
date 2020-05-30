import express from 'express';
const router = express.Router();

import connection from '../../conf/dbInfo';

//방 결제페이지 인증확인
const checkAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    //모달창 열기로 변경해야됨
    const params = req.params.number;
    const url = '/rooms/'+params;
    res.redirect(url);
};

//방 세부페이지 로그인확인
const checkIsAuthenticated = (req, res, next) => {
    //인증허가됨
    if (req.isAuthenticated()) {
        next();
    }
    const searchValue= req.query.place; // 호텔 이름
    res.render('room/detail',{'hotel_name':searchValue});
};
//방 세부 페이지 (쿼리스트링 지역이름 + 호텔방 이름)
router.get('/:number',checkIsAuthenticated,  (req, res) => {
    const nickname = req.user.nickname; // 유저 아이디
    const searchValue= req.query.place; // 호텔 이름

    res.render('room/detail',{'hotel_name':searchValue,'nickname':nickname});
});

//방 확인 및 결제 페이지
router.get('/:number/reservation/payment',checkAuth, (req, res)=> {
    res.render('room/reservation');
});

export default router;
