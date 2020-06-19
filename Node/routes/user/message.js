import express from 'express';
import connection from '../../conf/dbInfo';

const router = express.Router();

const checkAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    //모달창 열기로 변경해야됨
};

// 유저 로그인했을때만 메시지페이지
router.get('/', checkAuth, (req, res) => {
    const nickname = req.user.nickname;

    //메시지 최초 10개 전달
    const sql = 'select  a.* ,b.aid, b.date, b.item_name from `message` AS `a` INNER JOIN `order` AS `b` WHERE a.user_name = ? OR a.host_name = ?  GROUP BY a.time ORDER BY a.time DESC LIMIT 10';
    connection.query(sql, [nickname, nickname], (err, row) => {
        if (err) throw  err;

        // 숙박 날짜만 가져와서 재저장
        row.forEach((val) => {
            val.date = JSON.parse(val.date);

            // // 접속자가 호스트라면
            // if(val.host_name===nickname){
            //
            // }
            // else{
            //
            // }
        });
        console.log(row);


        res.render('user/message', {'nickname': nickname, 'message': row});
    });

});

export default router;
