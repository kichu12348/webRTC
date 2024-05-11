import http from 'http';
import { Server } from 'socket.io';

const port = process.env.PORT || 8080;

const server = http.createServer();
const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

let roomidToUser = [];

io.on('connection', (socket) => {
    socket.on('joinRoom', ({ roomID, username }) => {
        socket.join(roomID);
        if (!roomidToUser.some(room => room.username === username)) {
            roomidToUser.push({ roomID, username });
        }
        if (roomidToUser.find(room => room.roomID === roomID).length > 1) {
            io.to(roomID).emit('roomUser', { username, bool: true, socketID: socket.id });
        }
    });

    socket.on('calling', ({ offer, to }) => {
        io.to(to).emit('calling', { offer, to });
    });

    socket.on('answer', ({ answer, to }) => {
        io.to(to).emit('answer', { answer, to });
    });

    socket.on('error',(err) => {
        console.log(err);
    });
});

server.listen(port, () => {
    console.log(`Server running on port ${port} 🚀`);
});