import express from 'express';
const router = express.Router();

import mysql from '../../conf/dbInfo';

router.get('/:places', (req, res) => {
    res.render('room/search');
});

router.get('/', (req, res) => {

    let searchValue= req.query.place;

    res.render('room/search',{title:searchValue});
});

export default router;
