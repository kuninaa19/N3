import express from 'express';
const router = express.Router();

import mysql from '../conf/dbInfo';


  /* GET home page. */
router.get('/', function (req, res) {
    res.render('index');
  });

export default router;  // 단하나의 모듈
// export {router}; //ES6
// module.exports = router; // nodeJS
