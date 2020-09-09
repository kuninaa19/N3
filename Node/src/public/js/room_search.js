// checkTyping() 검색창 타이핑개수 확인
// roomSearch() 검색창내부에 작성된 내용있을때 폼 전송

const search = document.getElementById("searchButton");

const checkTyping = () => {
    let place = document.getElementById("place").value;
    let count = place.length;

    if (count !== 0) {
        return true;
    } else {
        document.getElementById("place").focus();
        return false;
    }
};

const roomSearch = () => {
    let key = checkTyping();

    if (key) {
        document.getElementById("search").submit();
    }
};

search.addEventListener("click", roomSearch);
