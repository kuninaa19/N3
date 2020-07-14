import express from 'express';
import connection from '../../conf/dbInfo';

const router = express.Router();

const checkAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }

    res.send("<script>alert('접속할 수 없는 페이지 입니다.'); history.go(-1);</script>");
};

router.get('/', checkAuth, (req, res) => {
    const nickname = req.user.nickname;
    res.render('user/info/info_index',{'nickname':nickname});
});

export default router;
