// getLatLng() DB에 저장된 위도경도 가져오기
// initMap()  구글맵스 API 위치 초기화

const getLatLng = async () => {
    return new Promise((resolve, reject) => {
        const baseUrl = getBaseUrl();

        const xhr = new XMLHttpRequest();
        xhr.open('POST', baseUrl + 'rooms/location', true);
        xhr.setRequestHeader("Content-Type", "application/json");

        const data = {
            hotelName: document.getElementsByClassName('hotel_name')[0].innerText
        };

        xhr.onload = () => resolve(xhr.responseText);
        xhr.onerror = () => reject(xhr.statusText);

        xhr.send(JSON.stringify(data));
    }).then((response) => {
        return JSON.parse(response);
    });
};

// 구글지도 위치 초기화
const initMap = async () => {
    const hotelLocation = await getLatLng();
    console.log(hotelLocation);

    const hotel = {lat: parseFloat(hotelLocation.map_let), lng: parseFloat(hotelLocation.map_lng)};
    // const hotel = {lat: 3.1530914, lng: 101.7051983};
    const icons = {
        hotel: {
            icon: 'https://img.icons8.com/material-sharp/36/000000/cottage.png'
        },
        restaurant: {
            icon: 'https://img.icons8.com/plasticine/36/000000/restaurant.png'
            // icon: 'https://img.icons8.com/ios-glyphs/36/000000/restaurant.png'
        },
        attraction: {
            icon: 'https://img.icons8.com/ios-filled/24/000000/camera.png'
        },
    };
    const map = new google.maps.Map(
        document.getElementById('map'), {zoom: 15, center: hotel});

    const marker = new google.maps.Marker({
        position: hotel, icon: icons.hotel.icon,
        map: map
    });
};

window.onload = () => {
    initMap();

    // 페이지 접속시 숙박 총요금 계산 (detail.js)
    totalCheck();
};