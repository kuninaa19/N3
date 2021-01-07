import {Router} from 'express';
import middlewares from '../../middlewares';
import TripService from "../../../services/trip";

const route = Router();

export default (app) => {
    app.use('/trip', route);

    route.get('/', middlewares.isAuth, async (req, res) => {
        const nickname = req.user.nickname;

        const tripServiceInstance = new TripService();
        const reservation = await tripServiceInstance.showBooking(nickname);

        res.render('user/trip/trip_index', {'nickname': nickname, 'rooms': reservation});

    });

    route.get('/:aid', middlewares.isAuth, async (req, res) => {
        const nickname = req.user.nickname;
        const bookingId = req.params.aid;

        const tripServiceInstance = new TripService();
        const reservation = await tripServiceInstance.showBookingDetail(bookingId);

        res.render('user/trip/trip_detail', {'nickname': nickname, 'roomInfo': reservation});
    });
};