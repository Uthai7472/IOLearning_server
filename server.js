const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

let interval;
let currentRandomNumber = 0;

// Allow requests from your Netlify frontend URL
const allowedOrigins = ['https://io-learning-client.netlify.app/', 'http://localhost:5173'];  // Add your Netlify URL here

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like curl requests or Postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}));

io.on('connection', (socket) => {
    console.log('A client connected:', socket.id);

    // Handle events here
    socket.on('message', (data) => {
        console.log('Received message:', data);
        socket.emit('message', `Server received: ${data}`);

        // Broadcast to all clients except the sender
        socket.broadcast.emit('message', `Server received: ${data}`);
    });

    socket.on('add', (sumValue) => {
        console.log('Received add:', sumValue);
        socket.emit('add', `Server received from client: ${sumValue}`);

        socket.broadcast.emit('add', `Server received from client: ${sumValue}`);
    });

    // io.emit('randomNumber', currentRandomNumber);
    // Start emitting random numbers every second
    console.log("Start random");
    if (!interval) {
        interval = setInterval(() => {
            currentRandomNumber = Math.floor(Math.random() * 100);
            io.emit('randomNumber', currentRandomNumber);
            console.log('Current random number:', currentRandomNumber);
        }, 1000); // Emit every 1 second (1000 milliseconds)
    }

    socket.on('disconnect', () => {
        console.log('A client disconnected');
    });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});