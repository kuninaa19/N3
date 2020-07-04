// 파파고 언어감지 API AJAX 요청
const detectLng = () => {
    console.log('detectLng');
    const detect = new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.open("POST", "https://hotelbooking.kro.kr/papago/detectLangs", true);
        xhr.setRequestHeader("Content-Type", "application/json");

        // const chat = {content : req.session.message};
        const chat = {content : "detect"};
        console.log(chat);
        xhr.onload = () => resolve(xhr.responseText);
        xhr.onerror = () => reject(xhr.statusText);

        xhr.send(JSON.stringify(chat));
    });
    detect.then((response) => {
        const data = JSON.parse(response);
        const langCode = data.langCode;

        console.log('langCode',langCode);

        // storeData(req,langCode);

    }).catch(error => {
        console.log(`알 수 없는 에러가 발생함: ${error}`);
        // 반환값이 없음 => 실행이 계속됨
    });
};