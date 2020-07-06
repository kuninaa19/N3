// makeDateNotation() 소켓으로 메시지받았을때 class="dateNotation" 날짜표기부분 HTML만들기
// makeMessageBox() class="message_form" HTML 부분 만들기

// class="dateNotation" 날짜표기
const makeDateNotation = (data) => {
    const notation = new Promise((resolve, reject) => {
        const dateNode = document.createElement('div');
        dateNode.className = "dateNotation";

        const dateTextNode = document.createTextNode(data.LLtime);
        dateNode.appendChild(dateTextNode);

        document.getElementById('itemList').appendChild(dateNode);

        const dateNotation = document.getElementsByClassName('dateNotation');
        if (data.LLtime === dateNotation[dateNotation.length - 2].innerHTML) {
            dateNode.style.display = 'none';
        }
        resolve(data);
    });
    notation.then((values) => {
        makeMessageBox(values);
    })
};

//class="message_form" HTML 부분 만들기
const makeMessageBox = (data) => {
    // 프로필부분
    const inboxProfile = new Promise((resolve, reject) => {
        const inboxDivNode = document.createElement('div');
        inboxDivNode.style.padding = "0.3rem 0 0";

        const inboxImgNode = document.createElement('div');
        inboxImgNode.className = "profile_img";

        const imgNode = document.createElement('img');
        imgNode.src = "https://img.icons8.com/ios-filled/52/000000/user-male-circle.png";

        inboxImgNode.appendChild(imgNode);
        inboxDivNode.appendChild(inboxImgNode); // 일반박스

        resolve(inboxDivNode);
    });

    //실 채팅내용과 시간, 유저이름 표기
    const inboxChatView = new Promise((resolve, reject) => {
        //class= message_info
        const infoNameNode = document.createElement('span');
        const infoTimeNode = document.createElement('span');
        infoNameNode.className = "name";
        infoTimeNode.className = "time";

        const senderTextNode = document.createTextNode(data.sender);
        const timeTextNode = document.createTextNode(data.LTtime);
        infoNameNode.appendChild(senderTextNode);
        infoTimeNode.appendChild(timeTextNode);

        const messageInfoNode = document.createElement('div');
        messageInfoNode.className = "message_info";

        messageInfoNode.appendChild(infoNameNode);
        messageInfoNode.append(" ");
        messageInfoNode.appendChild(infoTimeNode);

        const externalNode = document.createElement('div');
        externalNode.appendChild(messageInfoNode);
        //class= message_info

        // class= message_detail
        const messageDetailExternalNode = document.createElement('div');

        const messageDetailNode = document.createElement('div');
        messageDetailNode.className = "message_detail";

        const msgNode = document.createTextNode(data.content);

        messageDetailNode.appendChild(msgNode);
        messageDetailExternalNode.appendChild(messageDetailNode);

        // 보낸사람과 접속한 유저아이디 동일할때는 번역버튼x
        if (data.sender !== userName) {
            //언어 클래스 메시지에 추가
            messageDetailNode.setAttribute('langCode', "null");

            const translateBtn = document.createElement('div');
            translateBtn.className = "translate_btn";

            const imgButtonNode = document.createElement('input');
            imgButtonNode.type = "button";
            imgButtonNode.id = "imgBtn";

            translateBtn.appendChild(imgButtonNode);
            messageDetailExternalNode.appendChild(translateBtn);

            translateBtn.addEventListener("click", function(e){forTranslation(this)}, false);
        }

        const chatNode = document.createElement('div');
        chatNode.className = "chat_view";

        chatNode.appendChild(externalNode);
        chatNode.appendChild(messageDetailExternalNode);

        resolve(chatNode);
    });

    // inbox, form 부분 처리하고 itemList에 추가
    Promise.all([inboxProfile, inboxChatView]).then((values) => {
        const messageFormNode = document.createElement('div');
        messageFormNode.className = "message_form";
        messageFormNode.setAttribute('data-item-id', data.item_id);

        const messageInboxNode = document.createElement('div');
        messageInboxNode.className = "message_inbox";

        // messageInboxNode.appendChild(inboxDivNode);
        // messageInboxNode.appendChild(chatNode);
        messageInboxNode.appendChild(values[0]);
        messageInboxNode.appendChild(values[1]);

        messageFormNode.appendChild(messageInboxNode);

        document.getElementById('itemList').appendChild(messageFormNode);

        chatView.scrollTop = chatView.scrollHeight;
    });
};

socket.on('msg', (data) => {
    makeDateNotation(data);
});