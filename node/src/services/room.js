import moment from "moment";
import roomModel from "../models/room";

export default class RoomService {
    constructor() {
    }

    async showRecentRoomList() {
        return await roomModel.getRecentRoomList();
    }

    async showRoomList(searchPlace) {
        const roomList = await roomModel.getRoomList(searchPlace);

        // 하루 숙박비 값만 가져와서 재저장, 평점 재저장
        roomList.forEach(function (val) {
            val.price = JSON.parse(val.price).perDay;
            if (val.count === 0) {
                val.score = 0;
            } else {
                val.score = (val.score / val.count).toFixed(1);
            }
        });
        return roomList;
    }

    // 방 세부페이지정보 가져오기
    async showRoomDetail(roomNumber) {
        const detail = await roomModel.getRoomDetail(roomNumber);
        detail.price = JSON.parse(detail.price);
        detail.simple_info = JSON.parse(detail.simple_info);
        detail.location = JSON.parse(detail.location);
        detail.introduction = detail.introduction.replace(/\n/g, '<br/>'); // 설명부분 엔터적용되서 나오도록 변경

        const review = await roomModel.getRoomReview(roomNumber);
        review.forEach(val => {
            val.date = moment(val.date).format('LL');
        });

        const scoreCount = await roomModel.getRoomScoreCount(roomNumber);
        scoreCount.forEach(function (val) {
            if (val.count === 0) {
                val.score = 0;
            } else {
                val.score = (val.score / val.count).toFixed(1);
            }
        });
        return {detail, review, scoreCount};
    }

    async showRoomPaymentDetail(roomNumber, reservationDate) {
        let paymentDetail = await roomModel.getRoomPaymentDetail(roomNumber);

        paymentDetail.price = JSON.parse(paymentDetail.price);
        paymentDetail.simple_info = JSON.parse(paymentDetail.simple_info);

        if (paymentDetail.count === 0) {
            paymentDetail.score = 0;
        } else {
            paymentDetail.score = (paymentDetail.score / paymentDetail.count).toFixed(1);
        }

        const formData = {
            'perDayFee': paymentDetail.price.perDay * reservationDate,   // 날짜가 적용된 숙박요금(청소비 제외)
            'day': reservationDate
        };
        return {paymentDetail, formData};
    }

    async showRoomLocation(roomName) {
        return await roomModel.getLocation(roomName);
    }

    async uploadImg(img) {
        return await roomModel.storeImg(img);
    }

    async uploadRoom(room) {
        return await roomModel.storeRoom(room);
    }
}