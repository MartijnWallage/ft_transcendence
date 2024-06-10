const canvas = document.getElementById("pongCanvas");
const ctx = canvas.getContext("2d");

// Paddle properties
const paddleWidth = 10, paddleHeight = 100, paddleSpeed = 5;
const player = { x: 0, y: canvas.height / 2 - paddleHeight / 2, width: paddleWidth, height: paddleHeight, dy: 0 };
const computer = { x: canvas.width - paddleWidth, y: canvas.height / 2 - paddleHeight / 2, width: paddleWidth, height: paddleHeight, dy: 0 };

// Ball properties
const ballSize = 10;
const ball = { x: canvas.width / 2, y: canvas.height / 2, width: ballSize, height: ballSize, dx: 4, dy: 4 };

// Key controls
let keys = {};
document.addEventListener("keydown", (event) => { keys[event.key] = true; });
document.addEventListener("keyup", (event) => { keys[event.key] = false; });

// draw functions

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

// update functions

function updatePaddle(paddle) {
	paddle.y += paddle.dy;
	if (paddle.y < 0) paddle.y = 0;
	if (paddle.y + paddle.height > canvas.height) paddle.y = canvas.height - paddle.height;
}

function updateBall() {
	ball.x += ball.dx;
	ball.y += ball.dy;

	if (ball.y < 0 || ball.y + ball.height > canvas.height) {
			ball.dy *= -1; // bounce off top and bottom
	}

	let paddle = (ball.dx < 0) ? player : computer;

	if (ball.x < player.x + player.width && ball.y > player.y && ball.y < player.y + player.height ||
			ball.x + ball.width > computer.x && ball.y > computer.y && ball.y < computer.y + computer.height) {
			ball.dx *= -1; // bounce off paddles
	}

	if (ball.x < 0) {
			// Computer scores
			resetBall();
	} else if (ball.x + ball.width > canvas.width) {
			// Player scores
			resetBall();
	}
}

function resetBall() {
	ball.x = canvas.width / 2;
	ball.y = canvas.height / 2;
	ball.dx *= -1; // change ball direction
}

// control paddles

function movePaddles() {
		if (keys["ArrowUp"]) player.dy = -paddleSpeed;
		else if (keys["ArrowDown"]) player.dy = paddleSpeed;
		else player.dy = 0;

		// Simple AI for computer
		if (computer.y + computer.height / 2 < ball.y) {
				computer.dy = paddleSpeed;
		} else {
				computer.dy = -paddleSpeed;
		}

		updatePaddle(player);
		updatePaddle(computer);
}

// main loop

function gameLoop() {
	// Clear the canvas
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Draw net, paddles, and ball
	drawNet();
	drawPaddle(player);
	drawPaddle(computer);
	drawBall(ball);

	// Update game state
	movePaddles();
	updateBall();

	requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();