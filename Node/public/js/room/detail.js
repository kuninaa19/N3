const reservationBtn = document.getElementById("greenBtn");


const makeReservation = () =>{
       console.log(document.getElementsByClassName("calendar_btn")[0].value);

};

reservationBtn.addEventListener("click",makeReservation);
