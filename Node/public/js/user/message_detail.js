// getLastPath() url 정보 가져오는 함수
// forTranslation () 파파고 언어감지와 채팅번역을 위한 메서드

const socket = io({transports: ['websocket']});

const getLastPath = url => {
    const rLastPath = /\/([a-zA-Z0-9._]+)(?:\?.*)?$/;
    return rLastPath.test(url) && RegExp.$1;
};

const room = getLastPath(window.location.pathname);
const sendBtn = document.getElementById('sendBtn');
const translateBtn = document.querySelectorAll('.translate_btn');
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

//파파고 언어감지와 채팅번역을 위한 메서드
const forTranslation = async (e) => {
    // 채팅내용 - 번역된적있는지 확인
    const msgDetailClass = e.parentElement.querySelectorAll('.message_detail');
    const checkTranslated = msgDetailClass[0].getAttribute('translate');

    //해당 채팅에서 번역버튼이 눌린적이 있는지 확인
    if (checkTranslated === "no") {
        const msgDetail = msgDetailClass[0].innerText;

        //채팅인덱스 얻기
        const msgForm = e.parentElement.parentElement.parentElement.parentElement.getAttribute('data-item-id');

        // 언어코드
        const lngCode = msgDetailClass[0].getAttribute('langCode');

        const data = new forTransMsg(msgForm, room, msgDetail, lngCode);

        //널이면 언어감지부터 널아니면 번역
        if (lngCode === 'none') {
            const detectLngCode = await detectLng(data);

            msgDetailClass[0].setAttribute('langCode', detectLngCode);
            data.lang = detectLngCode;
        }

        const transMsg = await translateLng(data);

        //번역처리이후 원문 가리기
        msgDetailClass[0].setAttribute('translate', 'yes');
        msgDetailClass[0].style.display = 'none';

        //번역된 언어 노출
        msgDetailClass[1].removeAttribute('hidden');
        msgDetailClass[1].innerText = transMsg.msg;
        msgDetailClass[1].setAttribute('langCode', transMsg.target);

    } else {
        //번역된 내용이 채팅창에 떠있는지 확인후 번역채팅비활성화하고 원본 띄워줌
        if (msgDetailClass[0].style.display === 'none') {
            msgDetailClass[0].style.display = 'block';
            msgDetailClass[1].style.display = 'none';
        } else {
            msgDetailClass[0].style.display = 'none';
            msgDetailClass[1].style.display = 'block';
        }
    }
};

// 초기 채팅내역 번역버튼리스너
Array.prototype.forEach.call(translateBtn, (btn) => {
    btn.addEventListener("click", () => {
        forTranslation(btn)
    }, false);
});
