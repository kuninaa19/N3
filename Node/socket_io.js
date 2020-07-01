import socket_io from "socket.io";

module.exports = function (app) {
    //8080서버를 읽을때마다 리스트에 사람 채워줌

    const io = socket_io.listen(app);
    let socketList = [];

    io.on('connection', function (socket) {
        // 특정 소켓에서 connection 이벤트가 발생할 시(소켓이 연결이 됐을때) socketList에 push해줍니다. socketlist에 추가
        socketList.push(socket);
        console.log('안녕');

        //소켓 미 연결시 연결해제시
        socket.on('disconnect', function () {
            // 특정 소켓에서 disconnect 이벤트가 발생할 시(소켓 연결이 해제됐을때) socketList에서 해당 socket을 삭제해줍니다
            //소켓저장된 위치를 찾아서 잘라줌 1개(splice 추가 삭제 코드다름.)
            console.log('잘ㅈ가');
            socketList.splice(socketList.indexOf(socket), 1);
        });
    });
};