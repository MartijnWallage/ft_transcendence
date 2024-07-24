import { canvas, ctx, monoColor, paddleSpeed, player1, player2, ball, scoreToWin, paddleWidth } from './pong-conf.js';
import { movePaddlesComputer } from './pong-ai.js';
import { gameState } from './game-state.js';
import { displayScoreTournament, updateScoreTournament } from './pong-tournament.js';
import { getRandomInt } from './pong-utils.js';

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

function updateScore(player) {
	player.score += 1;
	if (player.score === scoreToWin) {
		setTimeout(function() {
			displayWinMessage(`${player.name} wins!`);
		}, 100);
		gameState.gameRunning = false;
	} else {
		resetBall();
	}
}

function abs(x) {
	return x < 0 ? -x : x;
}

function updateBall() {
	
	// Bounce off top and bottom
	if (ball.y <= 0 || ball.y + ball.height >= canvas.height) {
		if (abs(ball.dy) < 1) {
			ball.dy = ball.dy < 0 ? -1 : 1;
		}
		ball.dy *= -1;
	}
	
	ball.x += ball.dx;
	ball.y += ball.dy;
	
	// Bounce off paddles
	let paddle = ball.dx < 0 ? player1 : player2;
	let bottomPaddle = paddle.y;
	let topPaddle = paddle.y + paddle.height;
	let bottomBall = ball.y;
	let topBall = ball.y + ball.height;
	let ballHitPaddle = topBall > bottomPaddle && bottomBall < topPaddle;
	let ballReachedPaddle = ball.dx < 0 ?
		ball.x + ball.width / 2 > paddle.x
			&& ball.x <= paddle.x + paddle.width : 
		ball.x + ball.width >= paddle.x
			&& ball.x + ball.width / 2 < paddle.x + paddle.width;
	let ballReachedSide = ball.dx < 0 ?
		ball.x + ball.width < 0 : 
		ball.x > canvas.width;
	
	// check if ball hit paddle or someone scored
	if (ballReachedPaddle && ballHitPaddle) {
		if (abs(ball.dx) == ball.serveSpeed) {
			ball.dx *= 2;
		} else {
			ball.dx *= -1.03;
		}

		let middleBall = (bottomBall + topBall) / 2;
		let middlePaddle = (bottomPaddle + topPaddle) / 2;
		ball.dy = (middleBall - middlePaddle) * 0.20;
	} else if (ballReachedSide) {
		let otherPlayer = ball.dx < 0 ? player2 : player1;
		updateScore(otherPlayer);
	}
}

// Serve
function resetBall() {
	ball.x = canvas.width / 2;
	ball.y = canvas.height / 2;
	ball.serve *= -1;
	ball.dx = ball.serveSpeed * ball.serve;
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
	if (keys["w"])
		player1.dy = -paddleSpeed;
	else if (keys["s"])
		player1.dy = paddleSpeed;
	else
		player1.dy = 0;
}

function movePaddlesPlayer2() {
	if (keys["ArrowUp"])
		player2.dy = -paddleSpeed;
	else if (keys["ArrowDown"])
		player2.dy = paddleSpeed;
	else
		player2.dy = 0;
}

// Display score

function displayScore() {
	ctx.font = '50px Bitfont';
	ctx.fillStyle = monoColor;
	ctx.fillText(player1.score, canvas.width / 2 - 80, 50);
	ctx.fillText(player2.score, canvas.width / 2 + 52, 50);
}

function displayWinMessage(message) {
	ctx.font = '30px Bitfont';
	message = message.toUpperCase();
	const textMetrics = ctx.measureText(message);
	const x = (canvas.width - textMetrics.width) / 2;
	const y = canvas.height / 2;
	const lineHeight = 30;
  
	// drawing rectangle to remove net
	ctx.fillStyle = 'black';
	ctx.fillRect(x, y - lineHeight, textMetrics.width, lineHeight * 2);
	ctx.fillStyle = monoColor;
  
	ctx.fillText(message, x, y);
}

function initTournamentGameState() {
	gameState.player1Score = 0;
	gameState.player2Score = 0;
	if (gameState.player1Score === scoreToWin) {
		gameState.scoreBoard[gameState.matchOrder[gameState.currentGameIndex - 1][0]] += 1;
		console.log('number of victory player '
			+ gameState.matchOrder[gameState.currentGameIndex - 1][0]
			+ ' :' 
			+ gameState.scoreBoard[gameState.matchOrder[gameState.currentGameIndex - 1][0]]);
	} else {
		gameState.scoreBoard[gameState.matchOrder[gameState.currentGameIndex - 1][1]] += 1;
		console.log('number of victory player '
			+ gameState.matchOrder[gameState.currentGameIndex - 1][1]
			+ ' :' 
			+ gameState.scoreBoard[gameState.matchOrder[gameState.currentGameIndex - 1][1]]);
	}
}

// Main loop
function gameLoop(mode)
{
	// Clear the canvas
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	// Draw net, paddles, and ball
	drawNet();
	drawPaddle(player1);
	drawPaddle(player2);
	drawBall(ball);
	if (mode ==='tournament'){
		displayScoreTournament();
		if (!gameState.gameRunning) { 
			initTournamentGameState();
			nextGame();
			return; 
		}
	} else {
		displayScore();
		if (!gameState.gameRunning) return;
	}

	// Update game state
	movePaddlesPlayer1();
	if (mode === 'user-vs-user') {
		movePaddlesPlayer2();
	}
	else if (mode === 'user-vs-computer') {
		movePaddlesComputer();
	}
	updatePaddle(player1);
	updatePaddle(player2);
	updateBall();
	if (mode === 'tournament') {
		gameState.gameRunning = updateScoreTournament();
	}
	requestAnimationFrame(gameLoop.bind(null, mode));
}

export {gameLoop, resetBall, displayScore, gameState, updateScoreTournament, displayScoreTournament};