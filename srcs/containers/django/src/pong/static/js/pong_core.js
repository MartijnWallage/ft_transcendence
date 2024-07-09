"use strict";
import {canvas, ctx, monoColor, paddleSpeed, player1, player2, ball, player1Score, player2Score} from './pong-conf.js';

// Draw functions

function drawRect(x, y, width, height, color) {
	ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawPaddle(paddle) {
	drawRect(paddle.x, paddle.y, paddle.width, paddle.height, ball.color);
}

function drawBall(ball) {
	drawRect(ball.x, ball.y, ball.width, ball.height, ball.color);
}

function drawNet() {
	for (let i = 0; i < canvas.height; i += 29) {
		drawRect(canvas.width / 2 - 7, i, 14, 14, monoColor);
    }
}

// Update functions

function updatePaddle(paddle) {
	paddle.y += paddle.dy;
	
    if (paddle.y < 0) {
		paddle.y = 0;
	}
	
    if (paddle.y + paddle.height > canvas.height) {
		paddle.y = canvas.height - paddle.height;
	}
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

// Serve
function resetBall() {
	ball.x = canvas.width / 2;
	ball.y = canvas.height / 2;
	ball.dx *= -1; // Change ball direction
	ball.dy = ball.dx / 2;
}

// Key controls
let keys = {};

document.addEventListener("keydown", (event) => { 
	keys[event.key] = true; 
});

document.addEventListener("keyup", (event) => {
	keys[event.key] = false;
});


// Control paddles
function movePaddlesPlayer1() {
	if (keys["w"]) {
		player1.dy = -paddleSpeed;
	}
    else if (keys["s"]) {
		player1.dy = paddleSpeed;
	}
    else {
		player1.dy = 0;
	}
}

function movePaddlesPlayer2() {
	if (keys["ArrowUp"]) {
		player2.dy = -paddleSpeed;
	}
	else if (keys["ArrowDown"]) {
		player2.dy = paddleSpeed;
	}
	else {
		player2.dy = 0;
	}
}

// Display score

function displayScore() {
	ctx.font = "40px Bitfont";
	ctx.fillStyle = monoColor;
	ctx.fillText(player1Score, canvas.width / 2 - 80, 30);
	ctx.fillText(player2Score, canvas.width / 2 + 50, 30);
}

export { drawRect, drawPaddle, drawBall, drawNet, updatePaddle, updateBall, resetBall, movePaddlesPlayer1, movePaddlesPlayer2, displayScore };