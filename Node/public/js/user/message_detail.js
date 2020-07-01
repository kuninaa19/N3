const sendBtn = document.getElementById('sendBtn');

sendBtn.addEventListener("click", function () {
    const message = document.getElementById('messageInput');

    if (message.value === '') {
        return;
    } else {
        alert('s');
    }

});
