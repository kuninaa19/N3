const userInfoBtn = document.querySelectorAll('.user_info_category'); // 좌측 유저 개인정보 카테고리
const writtenReviewBtn = document.getElementById('borderLine'); // 작성했떤 리뷰페이지로 이동
const makeReviewBtn = document.querySelectorAll('.review_btn'); // 리뷰작성버튼

userInfoBtn[0].addEventListener("click", function () {
});

userInfoBtn[1].addEventListener("click", function () {
});

writtenReviewBtn.addEventListener("click", function () {
    location.href = '/info/review';
});

const popUp = (e) => {
    const itemId = e.getAttribute('data-item-id');

    var url = "/info/review/writing";
    var name = "hotelbooking";
    var option = "width = 700, height = 600, top = 35%, left = 100%, location = no";
    window.open(url, name, option);
};

Array.prototype.forEach.call(makeReviewBtn, (btn) => {
    btn.addEventListener("click", () => {
        popUp(btn)
    }, false);
});