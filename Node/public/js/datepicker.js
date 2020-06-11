//diffDate() 입실날짜와 퇴실날짜 차이 계산

$(function() {
    $('input[name="daterange"]').daterangepicker({
        autoApply: true,
        minDate:new Date(),
        maxDate:new Date(Date.parse(new Date) + (30 * 1000 * 60 * 60 * 24)*3), //3달후
        opens: 'center',
        locale :{
            format: 'YYYY/MM/DD'
        }
    }, function(start, end, label) {
        // console.log("A new date selection was made: " + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD'));
        // console.log(document.getElementsByClassName("calendar_btn")[0].valueOf());
        const startDay = start.format('YYYY-MM-DD');
        const endDay = end.format('YYYY-MM-DD');
        diffDate(startDay,endDay);
    });
});

const diffDate = (start,end)=>{
    const startDate = start.split('-');
    const endDate = end.split('-');
    // 자바스크립트는 1개월 빼고 계산해야함
    const sDate = new Date(parseInt(startDate[0]), parseInt(startDate[1])-1, parseInt(startDate[2]));
    const eDate = new Date(parseInt(endDate[0]), parseInt(endDate[1])-1, parseInt(endDate[2]));
    const diff = eDate.getTime()-sDate.getTime();

    const diffTime = Math.floor(diff/(1000*60*60*24));
    console.log(diffTime);
};