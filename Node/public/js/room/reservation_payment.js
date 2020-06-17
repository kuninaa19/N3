// kakaoPay() 결제 링크 전송(카카오페이)
const paymentBtn = document.getElementById("paymentBtn");

paymentBtn.addEventListener("click",  () =>{
    if(kakaoBtn.value === "clicked") {
        kakaoPay();
    }
    else if(elNaverPayBtn.value==="clicked"){
        // naverPay();

    }else{
        alert('결제수단을 선택해 주세요');
    }
});

const kakaoPay = () => {
    const payment = new Promise((resolve, reject) => {
        const baseUrl = "https://hotelbooking.kro.kr";

        const xhr = new XMLHttpRequest();
        xhr.open('POST', baseUrl + '/kakao/payment/ready', true);
        xhr.setRequestHeader("Content-Type", "application/json");

        const hotel_name = document.getElementById("hotel_name").innerHTML;

        const price = {
            stayFee: document.getElementsByClassName('charge')[0].innerHTML,
            cleanFee: document.getElementsByClassName('charge')[1].innerHTML,
            serviceFee: document.getElementsByClassName('charge')[2].innerHTML,
            total: document.getElementById("total").innerHTML
        };

        const date = {
            startDay: document.getElementsByName("checkin")[0].value,
            endDay: document.getElementsByName("checkout")[0].value
        };

        const day = document.getElementsByName("day")[0].value;

        const message = document.querySelector(".message").value;

        const payInfo = new paymentInfo(hotel_name, price, date, day, message);

        xhr.onload = () => resolve(xhr.responseText);
        xhr.onerror = () => reject(xhr.statusText);

        xhr.send(JSON.stringify(payInfo));
    });

    payment.then((response) => {
        const result = JSON.parse(response);
        window.open(result, '카카오페이 결제', 'width=500px height=500px');
    });
};