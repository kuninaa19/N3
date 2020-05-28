import express from 'express';
const router = express.Router();

import mysql from '../../conf/dbInfo';

const checkAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    //모달창 열기로 변경해야됨
    res.redirect('/');
};

const checkNotAuth = (req, res, next) => {
    //인증허가됨
    if (req.isAuthenticated()) {
        return res.redirect('/dashboard');
    }
    next();
};
//방 세부 페이지
router.get('/:number',  (req, res) => {
    res.render('room/detail');
});

//방 확인 및 결제 페이지
router.get('/:number/reservation/payment',checkAuth, (req, res)=> {
    res.render('room/reservation');
});

export default router;
