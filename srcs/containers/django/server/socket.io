const express = require('express');
const https = require('https');
const fs = require('fs');
const socketIO = require('socket.io');

// Create an Express app
const app = express();

// Load SSL certificate and key
const privateKey = fs.readFileSync('/path/to/private.key', 'utf8');
const certificate = fs.readFileSync('/path/to/server.crt', 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Create an HTTPS server
const httpsServer = https.createServer(credentials, app);

// Initialize Socket.IO with the HTTPS server
const io = socketIO(httpsServer, {
    cors: {
        origin: "https://10.15.204.3:8443", // Replace with your actual frontend URL
        methods: ["GET", "POST"],
        // transports: ['websocket', 'polling'],
        credentials: true
    },
    allowEIO3: true
});

// Socket.IO connection handler
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Handle custom events, game logic, etc.
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Start the HTTPS server
const PORT = 8443;
httpsServer.listen(PORT, () => {
    console.log(`Server is running on https://10.15.204.3:${PORT}`);
});




// const fs = require('fs');
// const https = require('https');
// const socketIO = require('socket.io');

// const privateKey = fs.readFileSync('/home/hongbaki/Desktop/private.key', 'utf8');
// const certificate = fs.readFileSync('/home/hongbaki/Desktop/server.crt', 'utf8');
// const credentials = { key: privateKey, cert: certificate };

// const httpsServer = https.createServer(credentials);
// const io = socketIO(httpsServer, {
//     cors: {
//         origin: "https://10.15.204.3:8443", // Replace with your actual frontend URL
//         methods: ["GET", "POST"],
//         credentials: true
//     },
//     allowEIO3: true
// });

// let player1 = null;
// let player2 = null;

// io.on('connection', (socket) => {
//     console.log('Client connected');

//     // Assign players
//     if (!player1) {
//         player1 = socket;
//         socket.player = 'player1';
//     } else if (!player2) {
//         player2 = socket;
//         socket.player = 'player2';
//     }

//     // Start game if both players are connected
//     if (player1 && player2) {
//         startGame();
//     }

//     socket.on('disconnect', () => {
//         console.log('Client disconnected');
//         if (socket === player1) {
//             player1 = null;
//             if (player2) {
//                 player1 = player2;
//                 player1.player = 'player1';
//                 player2 = null;
//             }
//         } else if (socket === player2) {
//             player2 = null;
//         }
//     });

//     function startGame() {
//         console.log('Starting game for Player 1 and Player 2');
//         player1.emit('gameStart', { player: 'player1' });
//         player2.emit('gameStart', { player: 'player2' });
//     }
// });

// httpsServer.listen(8443, () => {
//     console.log('WebSocket server is running on https://10.15.204.3:8443');
// });