const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname));

let players = [];

io.on('connection', (socket) => {
    if (players.length < 2) {
        players.push(socket.id);
        console.log('Гравець підключився:', socket.id);

        if (players.length === 2) {
            io.emit('startGame', 'Гра почалась! Твій хід.');
            io.to(players[0]).emit('yourTurn', true);
            io.to(players[1]).emit('yourTurn', false);
        }
    } else {
        socket.emit('full', 'Кімната заповнена');
    }

    socket.on('shoot', (data) => {
        socket.broadcast.emit('receiveShot', data);
    });

    socket.on('shotResult', (data) => {
        socket.broadcast.emit('shotResult', data);
    });

    socket.on('disconnect', () => {
        players = players.filter(id => id !== socket.id);
        console.log('Гравець відключився');
    });
});

http.listen(3000, () => {
    console.log('Сервер http://localhost:3000');
});