import moment from "moment";
import bookingModel from '../models/booking';

export default class TripService {
    constructor() {
    }

    async showBooking(nickname) {
        let reservation = await bookingModel.getUserBooking(nickname);

        // 숙박 날짜만 가져와서 재저장
        reservation.forEach(function (val) {
            val.date = JSON.parse(val.date);

            // 년,월,일 한글 변환 적용
            val.date.startDay = moment(val.date.startDay).format("LL");
            val.date.endDay = moment(val.date.endDay).format("LL");
        });
        return reservation;
    }

    async showBookingDetail(bookingId) {
        let reservation = await bookingModel.getUserBookingDetail(bookingId);

        // 숙박 날짜만 가져와서 재저장
        reservation.forEach(function (val) {
            // 가격관련 JSON 파싱
            val.amount = JSON.parse(val.amount);

            // 날짜 JSON 파싱
            val.date = JSON.parse(val.date);

            val.reservedDay = moment(val.date.startDay).format("YYYY/MM/DD");

            // 년,월,일 한글 변환 적용
            val.date.startDay = moment(val.date.startDay).format("MMM Do (dd)");
            val.date.endDay = moment(val.date.endDay).format("MMM Do (dd)");
        });
        return reservation;
    }
}