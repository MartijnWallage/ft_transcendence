function displayScoreUserVsComputer() {
    ctx.font = "20px Arial";
    ctx.fillStyle = "white";
	ctx.fillText("Player 1 Score: " + player1Score, 20, 30);
	ctx.fillText("Player 2 Score: " + player2Score, canvas.width - 180, 30);
}

function updateScoreUserVsComputer() {
    if (ball.x < 0) {
        player2Score += 1;
        resetBall();
    } else if (ball.x + ball.width > canvas.width) {
        player1Score += 1;
        resetBall();
    }

    if (player1Score == scoreToWin){
		gameRunning = false;
		alert('Player 1 wins!');
		console.log('Player 1 wins!');
	}
	else if (player2Score == scoreToWin){
		gameRunning = false;
		alert('Player 2 wins!');
		console.log('Player 2 wins!');
	}
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx *= -1; // Change ball direction
    ball.dy = ball.dx / 2;
}


// Control paddles
function movePaddlesComputer() {
	if (player2.y + player2.height / 2 < ball.y) {
		player2.dy = paddleSpeed;
	} 
	else {
		player2.dy = -paddleSpeed;
	}
}

// Main loop

function gameLoopUserVsComputer() {
	if (!gameRunning) return;
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw net, paddles, and ball
    drawNet();
    drawPaddle(player1);
    drawPaddle(player2);
    drawBall(ball);
    displayScoreUserVsComputer();

    // Update game state
    movePaddlesPlayer1();
	movePaddlesComputer();
    updatePaddle(player1);
    updatePaddle(player2);
    updateBall();
    updateScoreUserVsComputer();

    requestAnimationFrame(gameLoopUserVsComputer);
}
