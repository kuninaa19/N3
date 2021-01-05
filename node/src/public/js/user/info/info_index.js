const userInfoBtn = document.querySelectorAll('.user_info_category'); // 좌측 유저 개인정보 카테고리
const writtenReviewBtn = document.getElementById('borderLine'); // 작성했떤 리뷰페이지로 이동
const makeReviewBtn = document.querySelectorAll('.review_btn'); // 리뷰작성버튼
const registerBtn = document.getElementById('register'); // 숙소등록버튼(호스트)
const withdrawalBtn = document.getElementById('withdrawal'); // 회원탈퇴버튼

userInfoBtn[0].addEventListener("click", function () {
});

userInfoBtn[1].addEventListener("click", function () {
});

writtenReviewBtn.addEventListener("click", function () {
    location.href = '/info/review';
});

// 호스트로 접속할때만 버튼리스너 활성화
if (registerBtn) {
    registerBtn.addEventListener("click", function () {
        location.href = '/host/room/register';
    });
}

withdrawalBtn.addEventListener("click", function () {
    return new Promise((resolve, reject) => {
        const baseUrl = getBaseUrl();

        const xhr = new XMLHttpRequest();
        xhr.open('DELETE', baseUrl + 'auth/withdrawal', true);
        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.onload = () => resolve(xhr.responseText);
        xhr.onerror = () => reject(xhr.statusText);

        xhr.send();
    }).then((response) => {
        const result = JSON.parse(response);

        if (result.key === true) {
            alert('회원탈퇴되었습니다.');
            location.replace("/");
        } else {
            alert('다시 시도해주세요');
        }
    });
});

const popUp = (e) => {
    const roomId = e.getAttribute('data-room-id');
    const sibling = e.nextSibling.nextSibling;
    const bookingId = sibling.getAttribute('data-booking-id');

    const url = "/info/review/writing";
    const option = "width = 700, height = 600, top = 35%, left = 100%, location = no";

    window.open(url, " ", option);

    const form = document.createElement("form");
    form.setAttribute("method", "POST");
    form.setAttribute("target", " ");
    form.setAttribute("action", url);

    const orderData = document.createElement("input");
    orderData.setAttribute("type", "hidden");
    orderData.setAttribute("name", "room");
    orderData.setAttribute("value", roomId);

    const roomData = document.createElement("input");
    roomData.setAttribute("type", "hidden");
    roomData.setAttribute("name", "order");
    roomData.setAttribute("value", bookingId);


    form.appendChild(orderData);
    form.appendChild(roomData);
    document.body.appendChild(form);

    form.submit();
};

Array.prototype.forEach.call(makeReviewBtn, (btn) => {
    btn.addEventListener("click", () => {
        popUp(btn)
    }, false);
});