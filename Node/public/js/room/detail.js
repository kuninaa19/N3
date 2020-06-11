// totalCheck() 숙박 합계요금 정산

let total = document.getElementById("total");

const totalCheck = charge => {
    let totalCharge = 0;

    for (let i = 0; i < 3; i++) {

        if (isNaN(parseInt(charge[i].innerHTML))) {
            totalCharge += 0;
        } else {
            totalCharge += parseInt(charge[i].innerHTML)
        }
    }
    return totalCharge;
};

window.onload = () => {
    let charge = document.getElementsByClassName("charge");

    total.innerText = totalCheck(charge);
};