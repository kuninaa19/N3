import socket_io from "socket.io";
import connection from './conf/dbInfo';
import moment from 'moment';
import timezone from 'moment-timezone'; // require('moment-timezone');

moment.tz.setDefault("Asia/Seoul");

module.exports = (app) => {
    const io = socket_io.listen(app);
    const socketList = [];
    // const userList = []; // 채팅방에 참여한 인원리스트

    io.on('connection', (socket) => {
        socketList.push(socket);

        socket.on('joinRoom', (data) => {
            socket.join(data.room, () => {
                console.log('joinRoom', data.room);
                // userList.push({
                //     socket : socket.id,  // 생성된 socket.id
                //     room : data.room  // 접속한 채팅방의 이름
                // });
                // console.log(userList);
                // console.log(socket.rooms);

                // io.to(data).emit('data', `${data.room}에 접속했어요`);
            });
            // console.log('방 현재인원',io.sockets.adapter.rooms[data.room].length);
            // console.log('방 현재참여자',io.sockets.adapter.rooms[data.room]);
        });

        // 클라이언트가 채팅 내용 전송
        socket.on('msg', (data) => {
            const msgInfo = {
                room_id: data.room_id,
                sender: data.sender,
                content: data.content,
                time: moment().format('YYYY-MM-DD HH:mm:ss')
            };

            const sql = 'insert into `chat` set ?';
            connection.query(sql, msgInfo, (err, row) => {
                if (err) throw  err;

                msgInfo.LLtime = moment(msgInfo.time).format('LL');
                msgInfo.LTtime = moment(msgInfo.time).format('LT');

                msgInfo.item_id =row.insertId;

                io.in(msgInfo.room_id).emit('msg', msgInfo); //자기자신포함 채팅방 전원에게 전송
            });

            const forUpdateSql = 'UPDATE message SET message=?,time=? WHERE room_id = ?';
            connection.query(forUpdateSql, [msgInfo.content,msgInfo.time,msgInfo.room_id], (err, row) => {
                if (err) throw  err;
            });
        });

        //소켓 연결해제
        socket.on('disconnect', () => {
            console.log('채팅방 나가기');
            //소켓저장된 위치를 찾아서 잘라줌 1개
            socketList.splice(socketList.indexOf(socket), 1);
        });
    });
};