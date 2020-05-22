import express from 'express';
const router = express.Router();

import mysql from '../../conf/dbInfo';

router.get('/:places', function (req, res) {
    res.render('room/search');
});

router.get('/', function (req, res) {

    let searchValue= req.query.place;

    res.render('room/search',{title:searchValue});
});

export default router;
