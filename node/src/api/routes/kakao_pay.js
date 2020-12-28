import {Router} from 'express';
import KakaoService from '../../services/kakao';

const route = Router();

export default (app) => {
    app.use('/kakao', route);

    route.post('/payment/ready', async (req, res) => {
        const roomDTO = req.body;
        const userDTO = req.user.nickname;

        const kakaoServiceInstance = new KakaoService();
        const resKakaoPay = await kakaoServiceInstance.readyKakaoPay(roomDTO, userDTO);

        //세션에 tid(결제 고유 번호) 저장 - 없으면 결제 승인완료 안됨
        req.session.tid = resKakaoPay.tid;
        // 예약하려는 날짜 저장
        req.session.date = roomDTO.date;
        req.session.message = roomDTO.message;
        req.session.host_name = roomDTO.host_name;

        req.session.save(() => {
            return res.json(resKakaoPay.next_redirect_pc_url);
        });
    });

    route.get('/payment/approve', async (req, res) => {
        const sessionDTO = req.session;
        const userDTO = req.user.nickname;
        const tokenDTO = req.query.pg_token;

        const kakaoServiceInstance = new KakaoService();
        const orderId = await kakaoServiceInstance.approveKakaoPay(sessionDTO, userDTO, tokenDTO);

        const msg = {
            room_id: orderId,
            message: sessionDTO.message,
            key: 'afterPayment'
        };

        // 세션 삭제
        delete req.session.tid;
        delete req.session.date;
        delete req.session.message;
        delete req.session.host_name;

        req.session.save(() => {
            // 문자열로 변환
            const langDTO = JSON.stringify(msg);

            // 파파고 언어감지 메소드 실행요청
            res.send(`<script>opener.location.href='javascript:detectLng(${langDTO});'; window.close();</script>`);
        });
    });

    // 결제에 대한 취소
    route.delete('/payment/cancel', async (req, res) => {
        const roomDTO = req.body;

        const kakaoServiceInstance = new KakaoService();
        await kakaoServiceInstance.cancelKakaoPay(roomDTO);

        res.json({key: 'done'});
        // res.send("<script> window.close(); </script>");
    });

    // 결제창열린상태에서 취소시 창 닫기
    route.get('/payment/cancel', (req, res) => {
        res.send("<script> window.close(); </script>");
    });

    // 결제 실패시 알림뜨고 창 닫음
    route.get('/payment/fail', (req, res) => {
        res.send("<script> alert('다시 시도해 주세요'); window.close(); </script>");
    });
};
