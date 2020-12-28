import {Router} from 'express';

const route = Router();

export default (app) => {
    app.use('/host', route);

    // 호스트 방 등록 페이지
    route.get('/room/register', (req, res) => {

        res.render('room/register');
    });
};