// 채팅창에서 언어감지와 번역기능을 위해 사용
// detectLng() 결제승인이후 전송할 메시지에 대한 언어감지, 채팅번역버튼 언어감지
// translateLng() 언어번역

const detectLng = (data) => {
    const detect = new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.open("POST", "https://hotelbooking.kro.kr/papago/detectLangs", true);
        xhr.setRequestHeader("Content-Type", "application/json");

        const chat = data;

        xhr.onload = () => resolve(xhr.responseText);
        xhr.onerror = () => reject(xhr.statusText);

        xhr.send(JSON.stringify(chat));
    });
    detect.then((response) => {
        const data = JSON.parse(response);
        if(data.key==='afterPayment'){
            location.href='/trip';
        }else{
            return data.key;
        }
    }).catch(error => {
        console.log(`에러발생: ${error}`);
    });
};

const translateLng = () => {
    const detect = new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.open("POST", "https://hotelbooking.kro.kr/papago/translate", true);
        xhr.setRequestHeader("Content-Type", "application/json");

        const chat = {
            room_id:id,
            message:e
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