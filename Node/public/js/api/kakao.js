//카카오페이 버튼

const kakaoBtn = document.getElementById("kakaoPayBtn");

kakaoBtn.addEventListener("click", () => {
    if (kakaoBtn.value === "nonClicked") {
        kakaoBtn.value = "clicked";
        kakaoBtn.style.border = "3px solid #222222";
    } else {
        kakaoBtn.value = "nonClicked";
        kakaoBtn.style.border = "0";
    }
});