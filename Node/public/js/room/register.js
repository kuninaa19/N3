// total_check() 세부 요금표 전체 더한 값 확인
// chargeDetail() 전체 입력된 요금 세부정보 값 대입

function total_check(charge) {
    let total=0;
    for(let i=0;i<3;i++){
        if(isNaN(parseInt(charge[i].value))){
            total += 0;
        }
        else{
            total += parseInt(charge[i].value)
        }
    }
    return total;
}

function chargeDetail() {
    let charge = document.getElementsByName('charge');
    let total;

    total = total_check(charge);


    document.getElementById('chargeAll').innerText= total;
}
