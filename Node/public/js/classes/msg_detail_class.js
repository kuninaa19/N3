//  user/message_detail.js 에서 메시지 정보를 담는 클래스
class msgInfo {
    constructor(id, sender, content) {
        this.room_id = id;
        this.sender = sender;
        this.content = content;
    }
}

//  user/message_detail.js 에서 파파고 API사용하기위한 메시지 정보를 담는 클래스
class forTransMsg {
    constructor(item_id, room_id, msg, lng_code) {
        this.item_id = item_id;
        this.room_id = room_id;
        this.message = msg;
        this.lang = lng_code;
    }
}