import {Router} from 'express';
import RoomService from "../../services/room";

const route = Router();

export default (app) => {
    app.use('/', route);

    route.get('/', async (req, res) => {
        const roomServiceInstance = new RoomService();
        const result = await roomServiceInstance.index();

        if (req.isAuthenticated()) {
            const nickname = req.user.nickname;

            res.render('index', {'nickname': nickname, 'rooms': result});
        } else {
            const flash = req.flash('error');

            res.render('index', {'rooms': result, 'message': flash});
        }
    });

    route.get('/logout', (req, res) => {
        res.clearCookie('accessToken');
        req.logout();
        req.session.save(function () {
            res.redirect('/');
        });
    });

    route.get('/search', async (req, res) => {
        const searchValue = req.query.place; // 검색 지역이름

        const roomServiceInstance = new RoomService();
        const roomList = await roomServiceInstance.getRoomList(searchValue);

        if (req.isAuthenticated()) {
            const nickname = req.user.nickname; // 유저 아이디
            res.render('room/search', {title: searchValue, 'nickname': nickname, 'rooms': roomList});
        } else {
            res.render('room/search', {title: searchValue, 'rooms': roomList});
        }
    });
};