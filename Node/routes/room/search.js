import express from 'express';
const router = express.Router();

import mysql from '../../conf/dbInfo';

router.get('/:places', function (req, res) {
    res.render('room/search');
});

export default router;
