import {Router} from 'express';
import middlewares from '../middlewares';
import RoomService from "../../services/room";

const route = Router();

export default (app) => {
    app.use('/rooms', route);

    //방 세부 페이지 (쿼리스트링 지역이름 + 호텔방 이름)
    route.get('/:number', async (req, res) => {
        const searchValue = req.params.number; // 호텔 번호

        const roomServiceInstance = new RoomService();
        const detail = await roomServiceInstance.roomDetail(searchValue);
        const review = await roomServiceInstance.roomReview(searchValue);
        const scoreCount = await roomServiceInstance.roomScoreCount(searchValue);

        if (req.isAuthenticated()) {
            const nickname = req.user.nickname; // 유저 아이디

            res.render('room/detail', {
                'roomsInfo': detail,
                'roomsReview': review,
                'nickname': nickname,
                'scoreCount': scoreCount
            });
        } else {
            res.render('room/detail', {'roomsInfo': detail, 'roomsReview': review, 'scoreCount': scoreCount});
        }
    });

    //방 확인 및 결제 페이지
    route.get('/:number/reservation/payment', middlewares.isAuth, async (req, res) => {
        const searchValue = req.params.number; // 호텔 번호

        const roomServiceInstance = new RoomService();
        const paymentDetail = await roomServiceInstance.roomPaymentDetail(searchValue);

        const formData = {
            // 날짜가 적용된 숙박요금(청소비 제외)
            'perDayFee': paymentDetail[0].value.perDay * req.query.day,
            'day': req.query.day
        };

        res.render('room/reservation', {'rooms': paymentDetail, 'reservationInfo': formData});
    });

    //숙소 위치 전달
    route.post('/location', async (req, res) => {
        const data = req.body;

        const roomServiceInstance = new RoomService();
        const rows = await roomServiceInstance.getLocation(data);

        res.json(rows);
    });
};
