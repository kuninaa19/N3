// 파파고 언어감지 API AJAX 요청
const detectLng = () => {
// const detectLng = (data) => {
    console.log('detectLng');
    const detect = new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.open("POST", "https://hotelbooking.kro.kr/papago/detectLangs", true);
        xhr.setRequestHeader("Content-Type", "application/json");

        const chat = {content : 'data'};
        // const chat = {content : data};
        console.log(chat);
        xhr.onload = () => resolve(xhr.responseText);
        xhr.onerror = () => reject(xhr.statusText);

        xhr.send(JSON.stringify(chat));
    });
    detect.then((response) => {
        const data = JSON.parse(response);
        const langCode = data.langCode;

        console.log('langCode',langCode);

    }).catch(error => {
        console.log(`에러발생: ${error}`);
    });
};