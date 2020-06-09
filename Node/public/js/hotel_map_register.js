// initMap() 지도 위치 초기화
// geocodeAddress() 검색한 값에 따라 위치변경
// changeLatLng() 위도 경도 대입

//지도 위치 초기화
function initMap() {
    const map = new google.maps.Map(document.getElementById('map'), {
        zoom: 10,
        center: {lat: 3.15, lng: 101.685922}
    });

    let geocoder = new google.maps.Geocoder();

    document.getElementById('submit').addEventListener('click', function () {
        geocodeAddress(geocoder, map);
    });
}

//검색한 값에 따라 위치변경
function geocodeAddress(geocoder, resultsMap) {
    let address = document.getElementById('address').value;
    geocoder.geocode({'address': address}, function (results, status) {
        if (status === 'OK') {
            resultsMap.setZoom(15);
            resultsMap.setCenter(results[0].geometry.location);
            let marker = new google.maps.Marker({
                map: resultsMap,
                position: results[0].geometry.location
            });
            let address_lat = results[0].geometry.location.lat();	//위도
            let address_lng = results[0].geometry.location.lng();	//경도


            changeLatLng(address_lat, address_lng);

            // alert('주소명 : ' + address + '\n\n위도 : ' + address_lat + '\n\n경도 : ' + address_lng);

        } else {
            alert('알파벳 대문자를 사용하지않고 정확한 이름을 입력해주세요: ' + status);
        }
    });
}

//위도 경도값 대입
function changeLatLng(lat, lng) {
    document.getElementById('map_let').innerHTML = lat;
    document.getElementById('map_lng').innerHTML = lng;
}