import {Router} from 'express';
import middlewares from '../../middlewares';
import MessageService from "../../../services/message";

const route = Router();

export default (app) => {
    app.use('/message', route);

    // 유저 로그인했을때만 메시지페이지
    route.get('/', middlewares.isAuth, async (req, res) => {
        const nickname = req.user.nickname;

        const messageServiceInstance = new MessageService();
        const {msg, opponent} = await messageServiceInstance.showMsg(nickname);

        res.render('user/message/message_index', {
            'nickname': nickname,
            'message': msg,
            'opponent': opponent
        });
    });

    // 채팅창(메시지 상세페이지)
    route.get('/:message_id', middlewares.isAuth, async (req, res) => {
        const nickname = req.user.nickname;
        const msgId = req.params.message_id;

        const messageServiceInstance = new MessageService();
        const {msg, LLTime, opponent} = await messageServiceInstance.showMessageDetail(msgId, nickname);

        res.render('user/message/message_detail', {
            'nickname': nickname,
            'contents': msg,
            'LLTime': LLTime,
            'opponent': opponent
        });
    });
};