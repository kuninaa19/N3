import express from 'express';
import connection from '../../conf/dbInfo';

const router = express.Router();

// 위치정보얻기
const getLanLng = (data, res) => {
    const sql = 'select location from room  WHERE name=?';
    connection.query(sql, data.hotelName, (err, row) => {
        if (err) throw  err;

        const location = JSON.parse(row[0].location);
        res.json(location);
    });
};

//숙소 위치 전달
router.post('/', (req, res) => {
    const data = req.body;

    getLanLng(data, res)
});

export default router;
