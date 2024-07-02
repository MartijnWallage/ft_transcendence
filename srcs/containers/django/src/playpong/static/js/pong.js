const canvas = document.getElementById("pongCanvas");
const ctx = canvas.getContext("2d");

// Paddle properties
const paddleWidth = 14, paddleHeight = 80, paddleSpeed = 6;
const player1 = { x: 10, y: canvas.height / 2 - paddleHeight / 2, width: paddleWidth, height: paddleHeight, dy: 0 };
const player2 = { x: canvas.width - paddleWidth - 10, y: canvas.height / 2 - paddleHeight / 2, width: paddleWidth, height: paddleHeight, dy: 0 };

// Ball properties
const ballSize = 14;
const ball = { x: canvas.width / 2, y: canvas.height / 2, width: ballSize, height: ballSize, dx: -7, dy: 6 };

// Score
let player1Score = 0, player2Score = 0;

// Key controls
let keys = {};
document.addEventListener("keydown", (event) => { keys[event.key] = true; });
document.addEventListener("keyup", (event) => { keys[event.key] = false; });

// Game mode
let gameMode = '';

// Draw functions

function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawPaddle(paddle) {
    drawRect(paddle.x, paddle.y, paddle.width, paddle.height, "white");
}

function drawBall(ball) {
    drawRect(ball.x, ball.y, ball.width, ball.height, "white");
}

function drawNet() {
    for (let i = 0; i < canvas.height; i += 20) {
        drawRect(canvas.width / 2 - 1, i, 2, 10, "white");
    }
}

function displayScore() {
    ctx.font = "20px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("Player 1 Score: " + player1Score, 20, 30);
    ctx.fillText("Player 2 Score: " + player2Score, canvas.width - 180, 30);
}

// Update functions

function updatePaddle(paddle) {
    paddle.y += paddle.dy;
    if (paddle.y < 0) paddle.y = 0;
    if (paddle.y + paddle.height > canvas.height) paddle.y = canvas.height - paddle.height;
}

function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.y < 0 || ball.y + ball.height > canvas.height) {
        ball.dy *= -1; // Bounce off top and bottom
    }

    let paddle = (ball.dx < 0) ? player1 : player2;

    if (ball.x < player1.x + player1.width && ball.y > player1.y && ball.y < player1.y + player1.height + ball.height / 2 ||
        ball.x + ball.width > player2.x && ball.y > player2.y && ball.y < player2.y + player2.height + ball.height / 2) {
        ball.dy = (ball.y - (paddle.y + paddle.height / 2)) * 0.25;
        ball.dx *= -1; // Bounce off paddles
    }
}

function updateScore() {
    if (ball.x < 0) {
        player2Score += 1;
        resetBall();
    } else if (ball.x + ball.width > canvas.width) {
        player1Score += 1;
        resetBall();
    }

    if (player1Score == 10 || player2Score == 10) {
        if (player1Score == 10) {
            alert("Player 1 wins!");
        } else {
            alert("Player 2 wins!");
        }
        player1Score = 0;
        player2Score = 0;
    }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx *= -1; // Change ball direction
    ball.dy = ball.dx / 2;
}

// Control paddles
function movePaddles() {
    // Player 1 controls
    if (keys["w"]) player1.dy = -paddleSpeed;
    else if (keys["s"]) player1.dy = paddleSpeed;
    else player1.dy = 0;

    // Player 2 controls
    if (gameMode === 'user-vs-user') {
        if (keys["ArrowUp"]) player2.dy = -paddleSpeed;
        else if (keys["ArrowDown"]) player2.dy = paddleSpeed;
        else player2.dy = 0;
    } else if (gameMode === 'user-vs-computer') {
        // Simple AI for computer
        if (player2.y + player2.height / 2 < ball.y) {
            player2.dy = paddleSpeed;
        } else {
            player2.dy = -paddleSpeed;
        }
    }

    updatePaddle(player1);
    updatePaddle(player2);
}

// Main loop

function gameLoop() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw net, paddles, and ball
    drawNet();
    drawPaddle(player1);
    drawPaddle(player2);
    drawBall(ball);
    displayScore();

    // Update game state
    movePaddles();
    updateBall();
    updateScore();

    requestAnimationFrame(gameLoop);
}

function initializeGame(player1Name, player2Name, mode) {
    gameMode = mode;
    console.log(`Starting game: ${player1Name} vs ${player2Name}`);
    gameLoop();
}




const socket = new WebSocket('wss://10.15.109.3:8443/ws/monitor/');

// Event handler when the WebSocket connection is opened
socket.onopen = function(event) {
    console.log('WebSocket connection opened');
    // Now you can send initial messages if needed
    socket.send(JSON.stringify({ type: 'hello' }));
};

// Event handler when a message is received from the WebSocket server
socket.onmessage = function(event) {
    const data = JSON.parse(event.data);
    console.log('Message from server:', data);
    
    // Example: Display the message on the webpage
    const messageElement = document.createElement('p');
    messageElement.textContent = data.message;
    document.body.appendChild(messageElement);
};

// Event handler when the WebSocket connection is closed
socket.onclose = function(event) {
    console.log('WebSocket connection closed');
};

// Example of sending a message after the connection is open
function sendMessage(message) {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
    } else {
        console.error('WebSocket is not open to send messages.');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Your JavaScript code here
    const remotePlay = document.getElementById('remotePlay');
    if (remotePlay) {
        remotePlay.addEventListener('click', initiateRemotePlay);
    } else {
        console.error('Remote play button not found in the DOM.');
    }

    function initiateRemotePlay() {
        const message = {
            action: 'initiate_remote_play',
        };
        websocket.send(JSON.stringify(message));
        console.log('Initiated remote play');
    }
});


// Assuming remotePlay is defined somewhere accessible in your code
// const remotePlay = document.getElementById('remotePlay');

// Function to initiate remote play
function initiateRemotePlay() {
    // Assuming 'websocket' is your WebSocket connection object

    // Construct the message payload
    const message = {
        action: 'initiate_remote_play',
        // You can include additional data if needed
        // Example: player_id: playerId,
    };

    // Send the message as JSON string
    websocket.send(JSON.stringify(message));

    // Optionally, you can handle success or notify the user
    console.log('Initiated remote play');
}

// Example usage: Assuming 'remotePlay' is your button triggering remote play
remotePlay.addEventListener('click', initiateRemotePlay);


// Example of sending a message to the WebSocket server
// const messageToSend = {
//     action: 'player_connected',
//     player_name: 'Player 2'
// };

// socket.send(JSON.stringify(messageToSend));


