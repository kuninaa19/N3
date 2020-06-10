var oPay = Naver.Pay.create({
    "mode": "production", // development or production
    // 네이버페이에서 제공하는 임의 클라이언트ID
    "clientId": "u86j4ripEt8LRfPGzQ8" // clientId
});

//직접 만드신 네이버페이 결제버튼에 click Event를 할당하세요
var elNaverPayBtn = document.getElementById("naverPayBtn");

elNaverPayBtn.addEventListener("click", function () {
    oPay.open({
        "merchantUserKey": ".",
        "merchantPayKey": ".",
        "productName": "호텔",
        "totalPayAmount": "1000",
        "taxScopeAmount": "1000",
        "taxExScopeAmount": "0",
        "returnUrl": "사용자 결제 완료 후 결제 결과를 받을 URL"
    });
});