//diffDate() 입실날짜와 퇴실날짜 차이 계산
//changeCharge() 날짜 변경에 따라서 순수 숙박요금 변경
// totalCheck() 숙박 합계요금 정산

$(function () {
    $('input[name="daterange"]').daterangepicker({
        autoApply: true,
        minDate: new Date(),
        maxDate: new Date(Date.parse(new Date) + (30 * 1000 * 60 * 60 * 24) * 3), //3달후
        opens: 'center',
        locale: {
            format: 'YYYY/MM/DD'
        }
    }, function (start, end, label) {
        // console.log("A new date selection was made: " + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD'));
        // console.log(document.getElementsByClassName("calendar_btn")[0].valueOf());
        const startDay = start.format('YYYY-MM-DD');
        const endDay = end.format('YYYY-MM-DD');
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
        changeCharge(diffTime + 1);

    } else {
        changeCharge(diffTime);
    }
};

//날짜 변경에 따라서 순수 숙박요금 변경
const changeCharge = (diff) => {
    let charge = document.getElementsByClassName("charge")[0]; // 변경되는 순수 숙박비
    let perDayCost = document.getElementById("per_day_cost").innerHTML; // 순수 하루 숙박비

    perDayCost = perDayCost.replace('₩', "");

    charge.innerHTML = parseInt(perDayCost) * diff;

    totalCheck();
};


//숙박 합계요금 정산
const totalCheck = () => {
    let total = document.getElementById("total");
    let charge = document.getElementsByClassName("charge");

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