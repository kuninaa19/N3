import express from 'express';
const router = express.Router();

import mysql from '../../conf/dbInfo';

const checkAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    //로그인 안되어있을때는 그냥 검색만
    const searchValue= req.query.place; // 검색 지역이름
    res.render('room/search',{title:searchValue});
};

router.get('/', checkAuth, (req, res) => {
    const nickname = req.user.nickname; // 유저 아이디
    const searchValue= req.query.place; // 검색 지역이름

    res.render('room/search',{title:searchValue,'nickname':nickname});
});

//추후 폐기[검색은 쿼리스트링이 남아야함]
router.get('/:places', (req, res) => {
    res.render('room/search');
});

export default router;
