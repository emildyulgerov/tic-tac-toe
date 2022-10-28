const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const app = express();
app.use('/', express.static('static'));
const server = http.createServer(app);
const io = socketIO(server);

const rooms = {};
const players = new Map();

io.on('connect', socket => {
    console.log('player connected');
    socket.on('selectRoom', roomId => {
        if (rooms[roomId] == undefined){
            rooms[roomId] = new Map();
        }
        const players = rooms[roomId];
        if (players.size >= 2){
            socket.emit('error', 'Room is full');
            return socket.disconnect();
        } else {
            socket.join(roomId);
            initGame(roomId, players, socket);
        }
    })
})


function initGame(roomId, players, socket){
 

    socket.on('position', pos => {
        console.log('Position:', pos);
        io.to(roomId).emit('position', pos);
    })

    socket.on('newGame', () => {
        console.log('new game initiated');
        io.to(roomId).emit('newGame');
    })

    socket.on('disconnect', () => {
        console.log('player left');
        players.delete(socket);
    });
    
   
    let symbol = 'X';
    if(players.size > 0) {
        const otherSymbol = [...players.values()][0];
        if (otherSymbol == 'X'){
            symbol = '0';
        }
    }
    players.set(socket, symbol);

    socket.emit('symbol', symbol);

    socket.on('chat message', data => {
        io.to(roomId).emit('chat message', data, symbol)
    })

}


server.listen(3000, () => console.log('server listening'));