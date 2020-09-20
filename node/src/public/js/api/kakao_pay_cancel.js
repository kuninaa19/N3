// kakaoPayCancel() 결제 취소(카카오페이)

//카카오페이 버튼
const cancelBtn = document.getElementById("cancelPayment");

cancelBtn.addEventListener("click", () => {
    const reservedDay = document.getElementById('reservedDay').innerHTML;
    const dateArray = reservedDay.split("/");
    const dateObj = new Date(dateArray[0], Number(dateArray[1]) - 1, dateArray[2]);
    const reservedTime = dateObj.getTime(); //예약된 시간

    const tTime = new Date().getTime();// 현재시간

    const betweenTime = (tTime - reservedTime);


    if (betweenTime < 0) {
        if (confirm(`예약을 취소하실건가요?`) === true) {
            kakaoPayCancel();
        }
    } else {
        alert(`예약을 취소할 수 없어요.`);
    }
});

const kakaoPayCancel = () => {
    return new Promise((resolve, reject) => {
        const baseUrl = getBaseUrl();

        const xhr = new XMLHttpRequest();
        xhr.open('DELETE', baseUrl + 'kakao/payment/cancel', true);
        xhr.setRequestHeader("Content-Type", "application/json");

        const info = document.querySelectorAll('.related_number');
        const pureAmount = (info[1].innerText).slice(0, -1);

        const data = {
            tid: info[0].innerText,
            amount: pureAmount
        };

        xhr.onload = () => resolve(xhr.responseText);
        xhr.onerror = () => reject(xhr.statusText);

        xhr.send(JSON.stringify(data));
    }).then((response) => {
        const result = JSON.parse(response);
        if (result.key === 'done') {
            location.replace('/trip');
        }
    });
};
