// 채팅창에서 언어감지와 번역기능을 위해 사용
// detectLng() 결제승인이후 전송할 메시지에 대한 언어감지, 채팅번역버튼 언어감지
// translateLng() 언어번역

const detectLng = (data) => {
    return new Promise((resolve, reject) => {
        const baseUrl = getBaseUrl();

        const xhr = new XMLHttpRequest();

        xhr.open("POST", baseUrl + 'papago/detectLangs', true);
        xhr.setRequestHeader("Content-Type", "application/json");

        const chat = data;
        xhr.onload = () => resolve(xhr.responseText);
        xhr.onerror = () => reject(xhr.statusText);

        xhr.send(JSON.stringify(chat));
    }).then((response) => {
        const data = JSON.parse(response);
        if (data.key === 'afterPayment') {
            //결제승인완료시 여행페이지로 이동
            location.replace('/trip');
        } else {
            return data.langCode;
        }
    }).catch(error => {
        console.log(`에러발생: ${error}`);
    });
};

const translateLng = (data) => {
    return new Promise((resolve, reject) => {
        const baseUrl = getBaseUrl();

        const xhr = new XMLHttpRequest();

        xhr.open("POST", baseUrl + 'papago/translate', true);
        xhr.setRequestHeader("Content-Type", "application/json");

        const chat = data;

        xhr.onload = () => resolve(JSON.parse(xhr.responseText));
        xhr.onerror = () => reject(xhr.statusText);

        xhr.send(JSON.stringify(chat));
    }).catch(error => {
        console.log(`에러발생: ${error}`);
    });
};