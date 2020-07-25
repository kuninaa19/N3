// 숙소 세부정보 링크 이동
const roomDetail = value => {
    location.href = `https://hotelbooking.kro.kr/rooms/${value}`;
};

// 여행지 숙소 리스트 페이지로 이동
const searchPlace = (e) => {
    const location = e.getElementsByClassName('desc_spacing')[0].innerText;
    window.location.href = `https://hotelbooking.kro.kr/search?place=${location}`;
};

const place = document.querySelectorAll('#recommendation');

// 추천하는 여행지 카드 리스너
Array.prototype.forEach.call(place, (btn) => {
    btn.addEventListener("click", () => {
        searchPlace(btn);
    }, false);
});