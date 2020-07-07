import express from 'express';
import connection from '../../conf/dbInfo';

const router = express.Router();

// 위치정보얻기
const getLanLng = (data, res) => {
    const sql = 'select b.location from `order` AS `a` INNER JOIN `room` AS `b` ON a.item_name=b.name WHERE a.aid=? AND a.item_name=?';
    connection.query(sql, [data.code, data.hotelName], (err, row) => {
        if (err) throw  err;

        console.log(row);
        const location = JSON.parse(row[0].location);
        console.log(location);
        res.json(location);
    });
};

//숙소 위치 전달
router.post('/', (req, res) => {
    const data = req.body;
    console.log(data);

    getLanLng(data, res)
});

export default router;
