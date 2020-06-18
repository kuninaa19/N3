// kakaoPay() 결제 링크 전송(카카오페이)

const paymentBtn = document.getElementById("paymentBtn");

paymentBtn.addEventListener("click", () => {
    if (kakaoBtn.value === "clicked") {
        kakaoPay();
    } else {
        alert('결제수단을 선택해 주세요');
    }
});

const kakaoPay = () => {
    const payment = new Promise((resolve, reject) => {
        const baseUrl = "https://hotelbooking.kro.kr";

        const xhr = new XMLHttpRequest();
        xhr.open('POST', baseUrl + '/kakao/payment/ready', true);
        xhr.setRequestHeader("Content-Type", "application/json");

        const hotelName = document.getElementById("hotel_name").innerHTML;

        const hostName = document.getElementsByName("host_name")[0].value;

        const price = document.getElementById("total").innerHTML;

        const date = {
            startDay: document.getElementsByName("checkin")[0].value,
            endDay: document.getElementsByName("checkout")[0].value
        };

        const day = document.getElementsByName("day")[0].value;

        const message = document.querySelector(".message").value;

        const payInfo = new paymentInfo(hotelName, hostName, price, date, day, message);

        xhr.onload = () => resolve(xhr.responseText);
        xhr.onerror = () => reject(xhr.statusText);

        xhr.send(JSON.stringify(payInfo));
    });

    payment.then((response) => {
        const result = JSON.parse(response);
        window.open(result, '카카오페이 결제', 'width=500px height=500px');
    });
};
