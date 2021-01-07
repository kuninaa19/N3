import {Router} from 'express';
import middlewares from '../middlewares';
import RoomService from "../../services/room";

const route = Router();

export default (app) => {
    app.use('/rooms', route);

    //방 세부 페이지 (쿼리스트링 지역이름 + 호텔방 이름)
    route.get('/:number', async (req, res) => {
        const roomNumber = req.params.number; // 호텔 번호

        const roomServiceInstance = new RoomService();
        const {detail, review, scoreCount} = await roomServiceInstance.showRoomDetail(roomNumber);

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
        const roomNumber = req.params.number; // 호텔 번호
        const reservationDate = req.query.day; // 예약하려는 날짜

        const roomServiceInstance = new RoomService();
        const {paymentDetail, formData} = await roomServiceInstance.showRoomPaymentDetail(roomNumber, reservationDate);

        res.render('room/reservation', {'rooms': paymentDetail, 'reservationInfo': formData});
    });

    //숙소 위치 전달
    route.post('/location', async (req, res) => {
        const roomName = req.body.hotelName;

        const roomServiceInstance = new RoomService();
        const location = await roomServiceInstance.showRoomLocation(roomName);

        res.json(location);
    });
};