const rateStarBtn = document.querySelectorAll('.rate_star'); // 평점

const starOnOff = (e) => {
    const score = parseInt(e.getAttribute('rate')) - 1;

    if (e.className === "rate_star") {
        console.log('starOn');
        for (let i = score; i > -1; i--) {
            rateStarBtn[i].className = "active_rate_star";
        }
    } else {
        console.log('starOff');
        for (let i = score + 1; i < 5; i++) {
            rateStarBtn[i].className = "rate_star";
        }
    }
};

Array.prototype.forEach.call(rateStarBtn, (btn) => {
    btn.addEventListener("click", () => {
        starOnOff(btn)
    }, false);
});
