import express from 'express';
const router = express.Router();

import mysql from '../../conf/dbInfo';

router.get('/', (req, res) => {
    res.render('user/trip');
});

export default router;
