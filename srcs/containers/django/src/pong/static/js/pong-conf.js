const canvas = document.getElementById("pongCanvas");
const ctx = canvas.getContext("2d");

// Paddle properties
const  paddleWidth = 14;
const  paddleHeight = 80;
const  paddleSpeed = 6;

const player1 = {
                x: 10,
                y: canvas.height / 2 - paddleHeight / 2, 
                width: paddleWidth, 
                height: paddleHeight,
                dy: 0 
};

const player2 = {
                x: canvas.width - paddleWidth - 10,
                y: canvas.height / 2 - paddleHeight / 2,
                width: paddleWidth,
                height: paddleHeight,
                dy: 0 
};

// Ball properties
const ballSize = 14;

const ball = {
            x: canvas.width / 2,
            y: canvas.height / 2,
            width: ballSize,
            height: ballSize,
            dx: -7,
            dy: 6
};

// Score
let player1Score = 0;
let player2Score = 0;

let scoreToWin = 3;

// Key controls
let keys = {};

document.addEventListener("keydown", (event) => { 
    keys[event.key] = true; 
});

document.addEventListener("keyup", (event) => {
    keys[event.key] = false; 
});



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

// Control paddles
function movePaddlesPlayer1() {
    if (keys["w"]) player1.dy = -paddleSpeed;
    else if (keys["s"]) player1.dy = paddleSpeed;
    else player1.dy = 0;
}

function movePaddlesPlayer2() {
	if (keys["ArrowUp"]) player2.dy = -paddleSpeed;
	else if (keys["ArrowDown"]) player2.dy = paddleSpeed;
	else player2.dy = 0;
}