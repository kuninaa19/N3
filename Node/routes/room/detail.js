import express from 'express';
const router = express.Router();

import mysql from '../../conf/dbInfo';

router.get('/:number', function (req, res) {
    res.render('room/detail');
});

export default router;  // 단하나의 모듈
// export {router}; //ES6
// module.exports = router; // nodeJS
