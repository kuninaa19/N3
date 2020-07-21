// openSearchModal() 검색창 모달 열기
//closeSearchModal()검색창 모달닫기
// clickNav() 네비바 클릭시 검색창 모달닫기
// inputPlace() 모달에서 숙박하려는 지역 클릭시 검색창에 띄워줌

const searchModalBtn = document.getElementById("place"); // 검색창
const searchModal = document.querySelector(".search_modal");
const searchModalOverlay = searchModal.querySelector(".search_modal_overlay");
const topNav = document.querySelector(".top_nav");
const countryBox = document.querySelectorAll('.country_box');

//검색창 모달 열기
const openSearchModal = () => {
    searchModal.classList.remove("hidden");
};

//검색창 모달닫기
const closeSearchModal = () => {
    searchModal.classList.add("hidden");
};

// 네비바 클릭시 검색창 모달닫기
const clickNav = () => {
    searchModal.classList.add("hidden"); // 검색모달창 열려있다면 닫음
};

// 모달에서 숙박하려는 지역 클릭시 검색창에 보여줌
const inputPlace = (e) => {
    searchModal.classList.add("hidden");
    const place = document.getElementById('place');
    place.value= e.getAttribute('country-id');
};

searchModalBtn.addEventListener("click", openSearchModal);
searchModalOverlay.addEventListener("click", closeSearchModal);
topNav.addEventListener("click", clickNav);

Array.prototype.forEach.call(countryBox, (btn) => {
    btn.addEventListener("click", () => {
        inputPlace(btn)
    }, false);
});