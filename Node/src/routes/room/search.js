import express from 'express';
import connection from '../../conf/dbInfo';

const router = express.Router();

// 검색한 지역 숙소정보 리스트 가져오기
const getRoomList = (searchValue) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT a.id,a.name,a.region,a.value,a.image,(SELECT COUNT(*) FROM `review` WHERE a.name = room_name) as count,(SELECT SUM(score) FROM `review` WHERE a.name = room_name) as score FROM `room` as a  WHERE a.region = ?';
        connection.query(sql, searchValue, (err, row) => {
            if (err) throw  err;

            // 하루 숙박비 값만 가져와서 재저장, 평점 재저장
            row.forEach(function (val) {
                val.value = JSON.parse(val.value).perDay;
                if (val.count === 0) {
                    val.score = 0;
                } else {
                    val.score = (val.score / val.count).toFixed(1);
                }
            });
            resolve(row);
        });
    }).catch(error => {
        console.log(`SQL 에러 발생: ${error}`);
        return false;
    });
};

router.get('/', async (req, res) => {
    const searchValue = req.query.place; // 검색 지역이름

    const roomList = await getRoomList(searchValue);

    if (req.isAuthenticated()) {
        const nickname = req.user.nickname; // 유저 아이디
        res.render('room/search', {title: searchValue, 'nickname': nickname, 'rooms': roomList});
    } else {
        res.render('room/search', {title: searchValue, 'rooms': roomList});
    }
});

export default router;
