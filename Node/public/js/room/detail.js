const reservationBtn = document.getElementById("greenBtn");

// 예약일자 지정후 폼전송
const makeReservation = () => {
    const formCheckIn = document.getElementsByName("checkin")[0].value;
    const formCheckOut = document.getElementsByName("checkout")[0].value;

    if (formCheckIn === formCheckOut) {
           alert('체크인과 체크아웃 날짜를 다르게 해주세요');
    } else {
        document.getElementById('frm').submit();
    }
};

reservationBtn.addEventListener("click", makeReservation);
