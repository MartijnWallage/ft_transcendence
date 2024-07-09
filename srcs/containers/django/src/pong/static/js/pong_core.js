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

function abs(x) {
	if (x < 0) {
		return -x;
	}
	return x;
}

function updateBall() {
	ball.x += ball.dx;
    ball.y += ball.dy;
	
	// Bounce off top and bottom
    if (ball.y < 0 || ball.y + ball.height > canvas.height) {
		ball.dy *= -1; 
    }
	
	// Bounce off paddles
	if (ball.x > player1.x && ball.x <= player1.x + player1.width) {
		if (ball.y > player1.y && ball.y < player1.y + player1.height) {
			ball.dy = (ball.y - (player1.y + player1.height / 2)) * 0.25;
			ball.dx *= -1.03;
		}
	} else if (ball.x + ball.width >= player2.x && ball.x < player2.x + player2.width) {
		if (ball.y > player2.y && ball.y < player2.y + player2.height) {
			ball.dy = (ball.y - (player2.y + player2.height / 2)) * 0.25;
			ball.dx *= -1.03;
		}
	}
}

// Serve
function resetBall() {
	ball.x = canvas.width / 2;
	ball.y = canvas.height / 2;
	serve *= -1;
	ball.dx = 3 * serve;
	ball.dy = getRandomInt(6);
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
	ctx.font = '50px Bitfont';
	ctx.fillStyle = monoColor;
	ctx.fillText(player1Score, canvas.width / 2 - 80, 50);
	ctx.fillText(player2Score, canvas.width / 2 + 52, 50);
}

export { drawRect, drawPaddle, drawBall, drawNet, updatePaddle, updateBall, resetBall, movePaddlesPlayer1, movePaddlesPlayer2, displayScore };