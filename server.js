const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const db = require('./db');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('command', (data) => {
        console.log('Command received:', data);
        handleCommand(data, (response) => {
            io.emit('update', response);
        });
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

function handleCommand(data, callback) {
    if (data.action === 'attack') {
        db.run("UPDATE players SET health = health - 10 WHERE username = ?", [data.username], function(err) {
            if (err) {
                return console.error(err.message);
            }
            callback({ message: 'Player attacked!', health: this.changes });
        });
    } else if (data.action === 'defend') {
        db.run("UPDATE players SET health = health + 5 WHERE username = ?", [data.username], function(err) {
            if (err) {
                return console.error(err.message);
            }
            callback({ message: 'Player defended!', health: this.changes });
        });
    } else {
        callback({ message: `Command ${data.action} executed!` });
    }
}
