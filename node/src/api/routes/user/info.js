import {Router} from 'express';
import middlewares from '../../middlewares';
import InfoService from "../../../services/info";
import moment from "moment";
import moment_timezone from 'moment-timezone';

moment.tz.setDefault("Asia/Seoul");

const route = Router();

export default (app) => {
    app.use('/info', route);

    //내정보 메인페이지
    route.get('/', middlewares.isAuth, async (req, res) => {
        const nickname = req.user.nickname;

        const infoServiceInstance = new InfoService();
        const reviewInfo = await infoServiceInstance.getAvailableReviewList(nickname);

        res.render('user/info/info_index', {'nickname': nickname, 'reviewList': reviewInfo});
    });

    // 내정보 작성했던 리뷰 목록 페이지
    route.get('/review', middlewares.isAuth, async (req, res) => {
        const nickname = req.user.nickname;

        const infoServiceInstance = new InfoService();
        const reviewInfo = await infoServiceInstance.getReviewList(nickname);

        res.render('user/info/info_review', {'nickname': nickname, 'reviewList': reviewInfo});
    });

    // 리뷰작성페이지
    route.post('/review/writing', middlewares.isAuth, async (req, res) => {
        const nickname = req.user.nickname;
        const roomId = req.body.room;
        const orderId = req.body.order;

        const infoServiceInstance = new InfoService();
        const roomInfo = await infoServiceInstance.getRoomInfo(roomId);

        res.render('user/info/info_review_writing', {
            'nickname': nickname,
            'roomInfo': roomInfo,
            'orderId': orderId,
            'roomId': roomId
        });
    });

    // 작성된 리뷰 저장
    route.post('/review/storage', middlewares.isAuth, async (req, res) => {
        const reviewData = req.body;
        reviewData.user_name = req.user.nickname;
        reviewData.date = moment().format('YYYY-MM-DD HH:mm:ss');

        const infoServiceInstance = new InfoService();
        const result = await infoServiceInstance.storeReview(reviewData);

        res.json({key: result});
    });

};