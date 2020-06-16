const initMap = () => {
    const hotel = {lat: 3.159210, lng: 101.705190};
    const map = new google.maps.Map(
        document.getElementById('map'), {zoom: 15, center: hotel});

    const marker = new google.maps.Marker({position: hotel, map: map});
};