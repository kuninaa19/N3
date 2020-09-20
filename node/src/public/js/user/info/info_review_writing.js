// starOnOff() 클릭이벤트리스너 - 숙소평점주기
// sendReview 폼전송 - 리뷰작성완료
// closeReview 창닫기

const rateStarBtn = document.querySelectorAll('.rate_star'); // 평점
const confirmBtn = document.querySelector('.confirm'); // 리뷰폼 전송
const closeBtn = document.querySelector('.close'); // 리뷰작성 취소

// 클릭이벤트리스너 - 숙소평점주기
const starOnOff = (e) => {
    const score = parseInt(e.getAttribute('rate')) - 1;

    // 평점처음선택 or 기존에 클릭한 평점보다 평점 상승
    if (e.className === "rate_star") {
        for (let i = score; i > -1; i--) {
            rateStarBtn[i].className = "active_rate_star";
        }
    } else {
        // 기존에 클릭한 평점보다 평점 하락
        for (let i = score + 1; i < 5; i++) {
            rateStarBtn[i].className = "rate_star";
        }
    }
};

//유저가 평점을 남긴여부 확인후 평점 반환
const checkRate = async () => {
    const rate = document.getElementsByClassName('active_rate_star').length;

    if (rate === 0) {
        alert('숙소에대한 평점을 남겨주세요');
        return false;
    } else {
        return rate;
    }
};

//리뷰작성폼 전송
const sendReview = (reviewRate, exId) => {
    return new Promise((resolve, reject) => {
        const baseUrl = getBaseUrl();

        const xhr = new XMLHttpRequest();
        xhr.open('POST', baseUrl + 'info/review/storage', true);
        xhr.setRequestHeader("Content-Type", "application/json");

        const data = {
            room_id: exId.room,
            order_id: exId.order,
            score: reviewRate,
            room_name: document.querySelector('.interval').innerText,
            content: document.querySelector('.message').value
        };

        xhr.onload = () => resolve(xhr.responseText);
        xhr.onerror = () => reject(xhr.statusText);

        xhr.send(JSON.stringify(data));
    }).then((response) => {
        const result = JSON.parse(response);
        if (result.key) {
            opener.location.replace('/info/review');
            window.close();

        } else {
            alert('다시시도 해주세요');
        }
    });
};

// 리뷰작성 폼 전송준비 메소드
const readyToSend = async (e) => {
    const rate = await checkRate();

    if (rate) {
        const exId = {
            order: e.target.getAttribute('data-order-id'),
            room: e.target.getAttribute('data-room-id')
        };

        await sendReview(rate, exId);
    }
};

// 리뷰작성창 닫기
const closeReview = () => {
    window.close();
};

Array.prototype.forEach.call(rateStarBtn, (btn) => {
    btn.addEventListener("click", () => {
        starOnOff(btn)
    }, false);
});

confirmBtn.addEventListener("click", (e) => {
    readyToSend(e)
});
closeBtn.addEventListener("click", closeReview);
