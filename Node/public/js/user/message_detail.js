// getLastPath() url 정보 가져오는 함수

const socket = io({transports: ['websocket']});

const getLastPath = url => {
    const rLastPath = /\/([a-zA-Z0-9._]+)(?:\?.*)?$/;
    return rLastPath.test(url) && RegExp.$1;
};

const room = getLastPath(window.location.pathname);
const sendBtn = document.getElementById('sendBtn');
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
        const msgInfo = {
            room_id: room,
            sender: userName,
            content: message.value
        };

        // 메시지 서버로 전송
        socket.emit('msg', msgInfo);

        //메시지창입력정보 초기화
        message.value = '';

        chatView.scrollTop = chatView.scrollHeight;
    }
});