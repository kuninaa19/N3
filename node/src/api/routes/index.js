import express from "express";
import asyncHandler from "express-async-handler";
import connection from "../../conf/dbInfo.js";

const router = express.Router();

// 메인페이지 하단 숙소카드를 위한 숙소정보가져오기
const getRoomList = () => {
    return new Promise(resolve => {
        const sql = 'SELECT id,image,name,region FROM `room` ORDER BY id DESC LIMIT 4';
        connection.query(sql, (err, row) => {
            if (err) throw  err;
            return resolve(row);
        });
    });
};

router.get('/', asyncHandler(async (req, res) => {
    const result = await getRoomList();

    if (req.isAuthenticated()) {
        const nickname = req.user.nickname;

        res.render('index', {'nickname': nickname, 'rooms': result});
    } else {
        const flash = req.flash('error');

        res.render('index', {'rooms': result, 'message': flash});
    }
}));

router.get('/logout', (req, res) => {
    res.clearCookie('accessToken');
    req.logout();
    req.session.save(function () {
        res.redirect('/');
    });
});

export default router;
