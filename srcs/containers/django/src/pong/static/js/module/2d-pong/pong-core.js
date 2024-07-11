import { canvas, ctx, monoColor, paddleSpeed, player1, player2, ball, getRandomInt, scoreToWin, paddleWidth } from './pong-conf.js';
import { movePaddlesComputer } from './pong-ai.js';
import { gameState } from './game-state.js';
import { displayScoreTournament, updateScoreTournament } from './pong-tournament.js';

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
	ball.serve *= -1;
	ball.dx = 3 * ball.serve;
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
	ctx.fillText(gameState.player1Score, canvas.width / 2 - 80, 50);
	ctx.fillText(gameState.player2Score, canvas.width / 2 + 52, 50);
}

function displayWinMessage(message) {
  ctx.font = '30px Bitfont';
  const textMetrics = ctx.measureText(message);
  const x = (canvas.width - textMetrics.width) / 2;
  const y = canvas.height / 2;

  ctx.fillText(message, x, y);
}

function updateScore() {
	if (ball.x < player1.x) {
		gameState.player2Score += 1;
		resetBall();
	} else if (ball.x + ball.width > canvas.width) {
		gameState.player1Score += 1;
		resetBall();
	}
	if (gameState.player1Score === scoreToWin) {
		setTimeout(function() {
			displayWinMessage('Player 1 wins!');
		}, 100);
		return false;
	}
	else if (gameState.player2Score === scoreToWin){
		setTimeout(function() {
			displayWinMessage('Player 2 wins!');
		} , 100);
		return false;
	}
	return true;
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
		if (!gameState.gameRunning){ 
			gameState.player1Score = 0;
			gameState.player2Score = 0;
			if (gameState.player1Score === scoreToWin) {
				gameState.scoreBoard[gameState.matchOrder[gameState.currentGameIndex - 1][0]] += 1;
				console.log('number of victory player ' + gameState.matchOrder[gameState.currentGameIndex - 1][0] + ' :' + gameState.scoreBoard[gameState.matchOrder[gameState.currentGameIndex - 1][0]]);
			} else {
				gameState.scoreBoard[gameState.matchOrder[gameState.currentGameIndex - 1][1]] += 1;
				console.log('number of victory player ' + gameState.matchOrder[gameState.currentGameIndex - 1][1] + ' :' + gameState.scoreBoard[gameState.matchOrder[gameState.currentGameIndex - 1][1]]);
			}
			nextGame();
			return; 
		}
	}
	else {
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
	else {
		gameState.gameRunning = updateScore();
	}
	requestAnimationFrame(gameLoop.bind(null, mode));
}

export {gameLoop, resetBall, displayScore, gameState, updateScoreTournament, displayScoreTournament};