//  로그인, 회원가입, 비밀번호 찾기 모달

//  스크롤 금지
const scroll = document.querySelector("body");

// 모달 작동 + 웹페이지 모달 제외부분 검은화면
const loginModal = document.querySelector(".login_modal");
const overlay = loginModal.querySelector(".modal_overlay");
// 모달 닫기버튼
const closeBtn = loginModal.querySelector("button");
// 모달 각 페이지마다 크기 다르게 변경
const modalSize = loginModal.querySelector(".modal_content");

// 인덱스페이지에서 회원가입 혹은 로그인 버튼  (모달활성화)
const openLogBtn=document.getElementById("openLogin");
const openRegBtn=document.getElementById("openRegister");

// 각각 다른 화면(로그인, 비밀번호 찾기, 회원가입) 접근시 다른 화면 비활성화 및 활성화
const logContent = document.getElementById("loginForm");
const regContent = document.getElementById("regForm");
const findPwContent=document.getElementById("findPwForm");

// 비밀번호 찾기, 로그인 ,회원가입 이동 버튼
const underContent = document.getElementById("content");

// 회원가입, 로그인 비번찾기 폼 전송 버튼
const regBtn = document.getElementById("regBtn");
const logBtn = document.getElementById("logBtn");
const findPwBtn = document.getElementById("findPwBtn");
const kakaoBtn = document.getElementsByName("kakao");
const naverBtn = document.getElementsByName("naver");

//비번찾기
// 비번찾기 페이지에서 로그인페이지로 이동
const backToLoginBtn = document.getElementById("go_login");
// 비번찾기 페이지에서 언더바 삭제
const underLine= document.getElementsByClassName("bottom_line");

//로그인
const openLogModal = ()=>{
    loginModal.classList.remove("hidden");

    regContent.classList.add("hidden");
    findPwContent.classList.add("hidden");
    logContent.classList.remove("hidden");

    //하단 비밀번호 찾기, 로그인 ,회원가입 이동 버튼
    regBtn.classList.remove("hidden");
    logBtn.classList.add("hidden");

    scroll.style.overflow= "hidden";
    modalSize.style.height="500px";
    underContent.classList.remove("hidden");
    underLine[0].style.display="inline-block";
};

//회원가입
const openRegModal = ()=>{
    loginModal.classList.remove("hidden");

    logContent.classList.add("hidden");
    findPwContent.classList.add("hidden");
    regContent.classList.remove("hidden");

    regBtn.classList.add("hidden");
    logBtn.classList.remove("hidden");

    scroll.style.overflow= "hidden";
    modalSize.style.height="570px";
    underContent.classList.remove("hidden");
    underLine[0].style.display="inline-block";
};
//비밀번호 찾기
const findPwModal = ()=>{
    logContent.classList.add("hidden");
    regContent.classList.add("hidden");
    findPwContent.classList.remove("hidden");

    underContent.classList.add("hidden");
    modalSize.style.height="500px%";
    underLine[0].style.display="inline-block";
};
const closeLogModal = ()=>{
    loginModal.classList.add("hidden");
    logContent.classList.remove("hidden");
    logBtn.classList.remove("hidden");
    scroll.style.overflow= "auto";
};
const closeRegModal = ()=>{
    loginModal.classList.add("hidden");
    regContent.classList.remove("hidden");
    regBtn.classList.remove("hidden");
    scroll.style.overflow= "auto";
};

const kakaoAuth = ()=>{
    location.href = "https://hotelbooking.kro.kr/auth/kakao";
};

const naverAuth = ()=>{
    location.href = "https://hotelbooking.kro.kr/auth/naver";
};

overlay.addEventListener("click",closeLogModal);
overlay.addEventListener("click",closeRegModal);
closeBtn.addEventListener("click",closeLogModal);
closeBtn.addEventListener("click",closeRegModal);
openLogBtn.addEventListener("click",openLogModal);
openRegBtn.addEventListener("click",openRegModal);
regBtn.addEventListener("click",openRegModal);
logBtn.addEventListener("click",openLogModal);
findPwBtn.addEventListener("click",findPwModal);
backToLoginBtn.addEventListener("click",openLogModal);
kakaoBtn[0].addEventListener("click",kakaoAuth);
naverBtn[0].addEventListener("click",naverAuth);
