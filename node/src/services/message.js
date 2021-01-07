import moment from 'moment';
import msgMdoel from '../models/message';

// 시간 45분 -> 60분 일 22시간 -> 24시간
moment.relativeTimeThreshold('m', 60);
moment.relativeTimeThreshold('h', 24);
moment.relativeTimeThreshold('M', 30);

moment.updateLocale('ko', {
    relativeTime: {
        future: "%s 후",
        past: "%s 전",
        s: "%d 초",
        ss: "%d 초",
        m: "%d 분",
        mm: "%d 분",
        h: "%d 시간",
        hh: "%d 시간",
        d: "%d 일",
        dd: "%d 일",
        M: "%d 달",
        MM: "%d 달",
        y: "%d 년",
        yy: "%d 년"
    }
});

export default class MessageService {
    constructor() {
    }

    async showMsg(nickname) {
        let msg = await msgMdoel.getMsg(nickname);

        // 대화하는 상대방 아이디
        let opponent = [];

        for (let i = 0; i < msg.length; i++) {
            // 숙박날짜 JSON 파싱
            msg[i].date = JSON.parse(msg[i].date);

            // 년,월,일 한글 변환 적용
            msg[i].date.startDay = moment(msg[i].date.startDay).format('LL');
            msg[i].date.endDay = moment(msg[i].date.endDay).format('LL');
            msg[i].time = moment(msg[i].time).fromNow();

            // 접속자가 집주인이면 방문객 이름, 접속자가 방문객이면 집주인 이름
            if (msg[i].host_name === nickname) {
                opponent[i] = msg[i].user_name;
            } else {
                opponent[i] = msg[i].host_name;
            }
        }
        return {msg, opponent};
    }

    async showMessageDetail(msgId, nickname) {
        let msg = await msgMdoel.getMsgDetail(msgId, nickname);

        if (msg.length === 0) {
            // res.send("<script>alert('접속할 수 없는 페이지 입니다.'); history.go(-1);</script>");
        } else {
            // 대화하는 상대방 아이디
            let opponent;

            if (msg[0].host_name === nickname) {
                opponent = msg[0].user_name;
            } else {
                opponent = msg[0].host_name;
            }
            // 날짜만 가져오기위한 배열
            let LLTime = [];

            for (let i = 0; i < msg.length; i++) {
                // 날짜만 가져오기
                LLTime[i] = moment(msg[i].time).format('LL');
                // 년,월,일 한글 변환 적용
                msg[i].time = moment(msg[i].time).format('LT');
            }
            return {msg, LLTime, opponent};
        }
    }
}