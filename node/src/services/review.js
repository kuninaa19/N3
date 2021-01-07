import moment from "moment";
import reviewModel from "../models/review";

export default class InfoService {
    constructor() {
    }

    async showWriteableReview(nickname) {
        const reviewRows = await reviewModel.getWriteableReview(nickname);

        // 숙박 날짜만 가져와서 재저장
        reviewRows.forEach(function (val) {
            val.date = JSON.parse(val.date);
            // 년,월,일 한글 변환 적용
            val.date.startDay = moment(val.date.startDay).format('LL');
            val.date.endDay = moment(val.date.endDay).format('LL');
        });

        return reviewRows;
    }

    async showWrittenReview(nickname) {
        return await reviewModel.getWrittenReview(nickname);
    }

    async showReviewInfoForWriting(roomId) {
        return await reviewModel.getReview(roomId);
    }

    async uploadReview(review) {
        return await reviewModel.storeReview(review);
    }
}