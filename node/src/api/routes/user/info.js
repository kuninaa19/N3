import {Router} from 'express';
import middlewares from '../../middlewares';
import ReviewService from "../../../services/review";
import moment from "moment";

const route = Router();

export default (app) => {
    app.use('/info', route);

    //내정보 메인페이지
    route.get('/', middlewares.isAuth, async (req, res) => {
        const nickname = req.user.nickname;

        const reviewServiceInstance = new ReviewService();
        const reviewInfo = await reviewServiceInstance.showWriteableReview(nickname);

        res.render('user/info/info_index', {'nickname': nickname, 'reviewList': reviewInfo});
    });

    // 내정보 작성했던 리뷰 목록 페이지
    route.get('/review', middlewares.isAuth, async (req, res) => {
        const nickname = req.user.nickname;

        const reviewServiceInstance = new ReviewService();
        const reviewInfo = await reviewServiceInstance.showWrittenReview(nickname);

        res.render('user/info/info_review', {'nickname': nickname, 'reviewList': reviewInfo});
    });

    // 리뷰작성페이지
    route.post('/review/writing', middlewares.isAuth, async (req, res) => {
        const nickname = req.user.nickname;
        const roomId = req.body.room;
        const bookingId = req.body.order;

        const reviewServiceInstance = new ReviewService();
        const roomInfo = await reviewServiceInstance.showReviewInfoForWriting(roomId);

        res.render('user/info/info_review_writing', {
            'nickname': nickname,
            'roomInfo': roomInfo,
            'bookingId': bookingId,
            'roomId': roomId
        });
    });

    // 작성된 리뷰 저장
    route.post('/review/storage', middlewares.isAuth, async (req, res) => {
        let review = req.body;
        review.user_name = req.user.nickname;
        review.date = moment().format('YYYY-MM-DD HH:mm:ss');

        const reviewServiceInstance = new ReviewService();
        const result = await reviewServiceInstance.uploadReview(review);

        res.json({key: result});
    });
};