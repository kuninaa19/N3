import express from 'express';
const router = express.Router();

import mysql from '../../conf/dbInfo';

router.get('/', function (req, res) {
    res.render('user/message');
});

export default router;
