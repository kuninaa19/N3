import express from 'express';
import connection from '../../conf/dbInfo';
const router = express.Router();



const checkAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    // alert창으로 로그인? 혹은 로그인모달창열기
};

router.get('/', checkAuth, (req, res) => {
    const nickname = req.user.nickname;
    res.render('user/trip',{'nickname':nickname});
});

export default router;
