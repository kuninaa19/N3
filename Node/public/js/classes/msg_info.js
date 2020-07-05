//  user/message_detail.js 에서 메시지 정보를 담는 클래스
class msgInfo {
    constructor(id, sender, content) {
        this.room_id = id;
        this.sender = sender;
        this.content = content;
    }
}