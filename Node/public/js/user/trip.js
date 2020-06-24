// detailTrip() 클릭시 여행 상세페이지로 이동

const detailTrip = params => {
    location.href = `https://hotelbooking.kro.kr/trip/${params}`;
};

const moveToMessage = params => {
    location.href = `https://hotelbooking.kro.kr/message/${params}`;
};

const moveToRoomInfo = params => {
    location.href = `https://hotelbooking.kro.kr/rooms/${params}`;
};