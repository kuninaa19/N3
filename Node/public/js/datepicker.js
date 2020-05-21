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
        console.log("A new date selection was made: " + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD'));
        console.log(document.getElementsByClassName("calendar_btn").valueOf());
    });
});
