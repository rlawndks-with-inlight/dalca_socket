const express = require('express');
const cors = require('cors');
const fs = require('fs')
const app = express();

app.use(cors());

const https = require('https');
const http = require('http');

const PORT = 5000;

app.get('/', (req, res) => {
    res.send('Hello')
})

const is_test = true;
let server = undefined
let BACK_URL = "";
if (is_test) {
    server = http.createServer(app)
    BACK_URL = 'http://localhost:8001';
} else {
    const options = { // letsencrypt로 받은 인증서 경로를 입력해 줍니다.
        ca: fs.readFileSync("/etc/letsencrypt/live/dalcapay.com/fullchain.pem"),
        key: fs.readFileSync("/etc/letsencrypt/live/dalcapay.com/privkey.pem"),
        cert: fs.readFileSync("/etc/letsencrypt/live/dalcapay.com/cert.pem")
    };
    server = https.createServer(options, app)
    BACK_URL = 'https://dalcapay.com:8443';
}
const io = require('socket.io')(server, {
    cors: {
        origin: ["http://localhost:2000", "https://dalcapay.com"],
        methods: ["GET", "POST"],
    }
});
io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('message', (msg) => {
        console.log('message: ' + JSON.stringify(msg));
        if (msg?.signup_user_level == 10) {
            io.emit('message', {
                site: 'manager',
                table: 'user',
                signup_user_level: 10
            });
        }
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(PORT, function () {
    console.log("Server on " + PORT)
});
