// getUrlParams() 예약하려는 체크인 체크아웃 날짜 값 가져오기(쿼리스트링)
// formSet() 결제버튼누를때 정보를 주기위한 폼정보 초기입력
// diffDate() 입실날짜와 퇴실날짜 차이 계산
// changeCharge() 날짜 변경에 따라서 순수 숙박요금 변경
// totalCheck() 숙박 합계요금 정산


const getUrlParams = () => {
    const params = {};
    window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, (str, key, value) => {
        params[key] = value;
    });
    formSet(params);

    return params;
};

const formSet = (params) => {
    const formCheckIn = document.getElementsByName("checkin")[0];
    const formCheckOut = document.getElementsByName("checkout")[0];
    const formDate = document.getElementsByName("day")[0];

    formCheckIn.value = params.checkin;
    formCheckOut.value = params.checkout;
    formDate.value = params.day;
};

$(function () {
    const info = getUrlParams();
    $('input[name="daterange"]').daterangepicker({
        autoApply: true,
        minDate: new Date(),
        maxDate: new Date(Date.parse(new Date) + (30 * 1000 * 60 * 60 * 24) * 3), //3달후
        opens: 'center',
        locale: {
            format: 'YYYY/MM/DD'
        },
        startDate: info.checkin,
        endDate: info.checkout
    }, function (start, end, label) {
        // console.log("A new date selection was made: " + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD'));
        // console.log(document.getElementsByClassName("calendar_btn")[0].valueOf());
        const startDay = start.format('YYYY-MM-DD');
        const endDay = end.format('YYYY-MM-DD');

        //form checkin, checkout 값 변경
        const formCheckIn = document.getElementsByName("checkin")[0];
        const formCheckOut = document.getElementsByName("checkout")[0];
        formCheckIn.value = startDay;
        formCheckOut.value = endDay;

        diffDate(startDay, endDay);
    });
});


// 입실날짜와 퇴실날짜 차이 계산
const diffDate = (start, end) => {
    const startDate = start.split('-');
    const endDate = end.split('-');
    // 자바스크립트는 1개월 빼고 계산해야함
    const sDate = new Date(parseInt(startDate[0]), parseInt(startDate[1]) - 1, parseInt(startDate[2]));
    const eDate = new Date(parseInt(endDate[0]), parseInt(endDate[1]) - 1, parseInt(endDate[2]));
    const diff = eDate.getTime() - sDate.getTime();

    const diffTime = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (diffTime === 0) {
        changeDate(diffTime + 1);
        changeCharge(diffTime + 1);

    } else {
        changeDate(diffTime);
        changeCharge(diffTime);
    }
};

//날짜 변경에 따라서 순수 숙박요금 변경
const changeCharge = diff => {
    const charge = document.getElementsByClassName("charge")[0]; // 변경되는 순수 숙박비
    let perDayCost = document.getElementById("per_day_cost").innerHTML; // 순수 하루 숙박비

    perDayCost = perDayCost.replace('₩', "");

    charge.innerHTML = parseInt(perDayCost) * diff;

    totalCheck();
};

const changeDate = diff => {
    const perDate = document.getElementById("per_date"); // 숙박일정에 따라 몇박인지 숫자 변경
    const str = `x ${String(diff)}박`;

    perDate.innerHTML = str;

    // form name="date" 에 저장
    const formDate = document.getElementsByName("day")[0];
    formDate.value = diff;
};

//숙박 합계요금 정산
const totalCheck = () => {
    const total = document.getElementById("total");
    const charge = document.getElementsByClassName("charge");

    let totalCharge = 0;

    for (let i = 0; i < 3; i++) {

        if (isNaN(parseInt(charge[i].innerHTML))) {
            totalCharge += 0;
        } else {
            totalCharge += parseInt(charge[i].innerHTML)
        }
    }
    total.innerText = totalCharge;
};

// 페이지 접속시 숙박 총요금 계산
window.onload = () => {
    totalCheck();
};