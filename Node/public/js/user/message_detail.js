// getLastPath() url 정보 가져오는 함수

const socket = io({transports: ['websocket']});

const getLastPath = url => {
    const rLastPath = /\/([a-zA-Z0-9._]+)(?:\?.*)?$/;
    return rLastPath.test(url) && RegExp.$1;
};

const room = getLastPath(window.location.pathname);
const sendBtn = document.getElementById('sendBtn');
const translateBtn = document.querySelectorAll ('.translate_btn');
const chatView = document.querySelector('.content');
const userName = document.getElementById('userName').innerText;

window.onload = () => {
    chatView.scrollTop = chatView.scrollHeight;

    socket.emit('joinRoom', {'room': room}); // 채팅방 입장 서버에 전송
};

sendBtn.addEventListener("click", function () {
    const message = document.getElementById('messageInput');

    if (message.value === '') {
        return;
    } else {
        const msg = new msgInfo(room, userName, message.value);

        // 메시지 서버로 전송
        socket.emit('msg', msg);

        //메시지창입력정보 초기화
        message.value = '';

        chatView.scrollTop = chatView.scrollHeight;
    }
});

//페이지접속시 생성된 채팅번역을 위한 메서드
const checkLng= (e) => {
    //채팅인덱스 얻기
    const msgForm = e.parentElement.parentElement.parentElement.parentElement.getAttribute('data-item-id');

    // 메시지작성자(상대방) 닉네임
    const senderName = e.parentElement.parentElement.getElementsByClassName('name')[0].innerText;

    // 채팅내용
    const msgDetail = e.parentElement.querySelector('.message_detail').innerText;

    // 언어코드
   const lngCode = e.parentElement.querySelector('.message_detail').getAttribute('langCode');
    console.log(lngCode);

    if(lngCode==='null'){
        console.log('null');
    }else{
        console.log('aa');
    }
};

// 초기 채팅내역 번역버튼리스너
Array.prototype.forEach.call(translateBtn, (btn) => {
    btn.addEventListener("click", () => {checkLng(btn)}, false);
});
