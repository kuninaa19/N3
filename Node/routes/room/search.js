import express from 'express';
import connection from '../../conf/dbInfo';
const router = express.Router();


const checkAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    //로그인 안되어있을때는 그냥 검색만
    const searchValue= req.query.place; // 검색 지역이름

    const sql = 'select `id`,`name`,`region`,`value`,`image` from `room` where region = ?';
    connection.query(sql,searchValue,(err, row) => {
        if (err) throw  err;

        // 하루 숙박비 값만 가져와서 재저장
        row.forEach(function(val){
            val.value =JSON.parse(val.value).perDay;
        });

        res.render('room/search',{title:searchValue,'rooms':row});
    });
};

router.get('/', checkAuth, (req, res) => {
    const nickname = req.user.nickname; // 유저 아이디
    const searchValue= req.query.place; // 검색 지역이름

    const sql = 'select * from `room` where region = ?';
    connection.query(sql,searchValue,(err, row) => {
        if (err) throw  err;

        // 하루 숙박비 값만 가져와서 재저장
        row.forEach(function(val){
            val.value =JSON.parse(val.value).perDay;
        });

        res.render('room/search',{title:searchValue,'nickname':nickname,'rooms':row});
    });
});

//추후 폐기[검색은 쿼리스트링이 남아야함]
router.get('/:places', (req, res) => {
    res.render('room/search');
});

export default router;
