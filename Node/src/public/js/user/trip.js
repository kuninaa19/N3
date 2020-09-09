// detailTrip() 클릭시 여행 상세페이지로 이동

const detailTrip = params => {
    location.href = `/trip/${params}`;
};

const moveToMessage = params => {
    location.href = `/message/${params}`;
};

const moveToRoomInfo = params => {
    location.href = `/rooms/${params}`;
};