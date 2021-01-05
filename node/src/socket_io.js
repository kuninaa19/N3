import socket_io from "socket.io";
import connection from './loaders/mysql';
import moment from 'moment';

export default (app) => {
    const io = socket_io.listen(app);
    const socketList = [];

    io.on('connection', (socket) => {
        socketList.push(socket);

        socket.on('joinRoom', (data) => {
            socket.join(data.room, () => {
                console.log('joinRoom', data.room);
            });
        });

        // 클라이언트가 채팅 내용 전송
        socket.on('msg', (data) => {
            const msgInfo = {
                room_id: data.room_id,
                sender: data.sender,
                content: data.content,
                time: moment().format('YYYY-MM-DD HH:mm:ss')
            };

            const sql = 'INSERT INTO `chat` SET ?';
            connection.query(sql, msgInfo, (err, row) => {
                if (err) throw  err;

                msgInfo.LLtime = moment(msgInfo.time).format('LL');
                msgInfo.LTtime = moment(msgInfo.time).format('LT');

                msgInfo.item_id = row.insertId;

                io.in(msgInfo.room_id).emit('msg', msgInfo); //자기자신포함 채팅방 전원에게 전송
            });

            const forUpdateSql = 'UPDATE `chat_window` SET message=?, time=? WHERE room_id = ?';
            connection.query(forUpdateSql, [msgInfo.content, msgInfo.time, msgInfo.room_id], (err) => {
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