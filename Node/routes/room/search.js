import express from 'express';
const router = express.Router();

import mysql from '../../conf/dbInfo';

router.get('/:places', function (req, res) {
    res.render('room/search');
});

export default router;  // 단하나의 모듈
// export {searchRouter}; //ES6
// module.exports = router; // nodeJS
