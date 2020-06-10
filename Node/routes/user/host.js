import express from 'express';
import connection from '../../conf/dbInfo';

const router = express.Router();

const checkAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    //모달창 열기로 변경해야됨
};

// router.get('/', checkAuth, (req, res) => {
// router.get('/',  (req, res) => {
//     const nickname = req.user.nickname;
//     res.render('user/message',{'nickname':nickname});
// });

// 호스트 방 등록 페이지
router.get('/room/register', (req, res) => {

    res.render('room/register');
});

export default router;
