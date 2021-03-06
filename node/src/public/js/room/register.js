// totalCheck() 세부 요금표 전체 더한 값 확인
// chargeDetail() 전체 입력된 요금 세부정보 값 대입
// uploadImages() 파일 업로드
// uploadInfo() 이미지 업로드후에 모든 정보 업로드

const totalCheck = charge => {
    let total = 0;

    charge.forEach(v => {
        if (isNaN(parseInt(v.value))) {
            total += 0;
        } else {
            total += parseInt(v.value)
        }
    });

    return total;
};

const chargeDetail = () => {
    const charge = document.getElementsByName('charge');
    let total;

    total = totalCheck(charge);

    document.getElementById('chargeAll').innerText = total;
};

// 이미지 저장
const uploadImages = () => {
    const uploadImage = new Promise((resolve, reject) => {
        const baseUrl = getBaseUrl();

        const xhr = new XMLHttpRequest();

        xhr.open("POST", baseUrl + 'upload/images', true);

        const formElement = document.getElementById('myForm');
        const formData = new FormData(formElement);

        xhr.onload = () => resolve(xhr.responseText);
        xhr.onerror = () => reject(xhr.statusText);
        xhr.send(formData);
    });

    uploadImage.then((response) => {
        const result = JSON.parse(response);
        console.log(result);
        if (result.key === true) {
            return uploadInfo(result.roomImageId);
        } else {
            alert('이미지 업로드에 실패했습니다. 다시시도 해 주세요');
        }
    })
};

//이미지 업로드후에 모든 정보 업로드
const uploadInfo = (roomImageId) => {
    const info = new Promise((resolve, reject) => {
        const baseUrl = getBaseUrl();

        let xhr = new XMLHttpRequest();
        xhr.open("POST", baseUrl + 'upload/info', true);
        xhr.setRequestHeader("Content-type", "application/json");

        const hotelName = document.getElementsByName("hotel_name")[0].value;
        const country = document.getElementsByName("country")[0].value;
        const region = document.getElementsByName("location")[0].value;
        const simpleInfo = {
            peopleNum: document.getElementsByName("people_num")[0].value,
            bedroom: document.getElementsByName("bedroom")[0].value,
            bed: document.getElementsByName("bed")[0].value,
            bathroom: document.getElementsByName("bathroom")[0].value,
        };
        const location = {
            map_let: document.getElementById('map_let').innerHTML,
            map_lng: document.getElementById('map_lng').innerHTML
        };
        const introduction = document.getElementsByClassName('message')[0].value;

        const price = {
            perDay: document.getElementsByName('charge')[0].value,
            cleanFee: document.getElementsByName('charge')[1].value,
            serviceFee: document.getElementsByName('charge')[2].value
        };

        const roomInfo = new room(hotelName, country, region, location, simpleInfo, introduction, price, roomImageId);

        xhr.onload = () => resolve(xhr.responseText);
        xhr.onerror = () => reject(xhr.statusText);
        xhr.send(JSON.stringify(roomInfo));
    });

    info.then((response) => {
        const result = JSON.parse(response);

        const roomNumber = result.roomNum;
        if (result.key === true) {
            location.href = `/rooms/${roomNumber}`;
        }
    })
};