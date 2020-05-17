import express from 'express';
const router = express.Router();

import mysql from '../../conf/dbInfo';

//방 세부 페이지
router.get('/:number', function (req, res) {
    res.render('room/detail');
});

//방 확인 및 결제 페이지
router.get('/:number/payment', function (req, res) {
    res.render('room/payment');
});

export default router;  // 단하나의 모듈
// export {router}; //ES6
// module.exports = router; // nodeJS
