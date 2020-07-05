// 파파고 언어감지 API AJAX 요청
// detectLng(x,y) 결제승인이후 전송할 메시지에 대한 언어감지

const detectLng = (id,msg) => {
    const detect = new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.open("POST", "https://hotelbooking.kro.kr/papago/detectLangs", true);
        xhr.setRequestHeader("Content-Type", "application/json");

        const chat = {
          room_id:id,
          message:msg
        };

        xhr.onload = () => resolve(xhr.responseText);
        xhr.onerror = () => reject(xhr.statusText);

        xhr.send(JSON.stringify(chat));
    });
    detect.then((response) => {
        const data = JSON.parse(response);
        if(data.key===true){
            location.href='/trip';
        }
    }).catch(error => {
        console.log(`에러발생: ${error}`);
    });
};