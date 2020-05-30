import express from 'express';
const router = express.Router();

import mysql from '../../conf/dbInfo';

const checkAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    //모달창 열기로 변경해야됨
};

// 유저 로그인했을때만 메시지페이지
router.get('/', checkAuth, (req, res) => {
    const nickname = req.user.nickname;
    res.render('user/message',{'nickname':nickname});
});

export default router;
