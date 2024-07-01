// File: static/js/manager.js
const socket = io('https://10.15.204.3:8443');

socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('gameStart', (data) => {
    if (data.player === 'player1') {
        console.log('You are Player 1');
        // Start game logic for Player 1
    } else if (data.player === 'player2') {
        console.log('You are Player 2');
        // Start game logic for Player 2
    }
});

socket.on('disconnect', (reason) => {
    console.log('Disconnected from server:', reason);
});
