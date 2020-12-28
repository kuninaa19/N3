import {Router} from 'express';
import middlewares from '../../middlewares';
import TripService from "../../../services/trip";

const route = Router();

export default (app) => {
    app.use('/trip', route);

    route.get('/', middlewares.isAuth, async (req, res) => {
        const nickname = req.user.nickname;

        const tripServiceInstance = new TripService();
        const result = await tripServiceInstance.searchTripInfo(nickname);

        res.render('user/trip/trip_index', {'nickname': nickname, 'rooms': result});

    });

    route.get('/:aid', middlewares.isAuth, async (req, res) => {
        const nickname = req.user.nickname;
        const searchValue = req.params.aid;

        const tripServiceInstance = new TripService();
        const result = await tripServiceInstance.searchTripDetail(searchValue);

        res.render('user/trip/trip_detail', {'nickname': nickname, 'roomInfo': result});
    });
};



