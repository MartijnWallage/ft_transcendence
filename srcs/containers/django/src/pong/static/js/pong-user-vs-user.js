
function updateScoreUserVsUser() {
    if (ball.x < 0) {
        player2Score += 1;
        resetBall();
    } else if (ball.x + ball.width > canvas.width) {
        player1Score += 1;
        resetBall();
    }

    if (player1Score === scoreToWin){
		gameRunning = false;
		setTimeout(function() {
			alert('Player 1 wins!');
		} , 100);
		return false;
	}
	else if (player2Score === scoreToWin){
		gameRunning = false;
		setTimeout(function() {
			alert('Player 2 wins!');
		} , 100);
		return false;
	}
	return true;
}

function gameLoopUserVsUser() {
	// Clear the canvas

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Draw net, paddles, and ball
	drawNet();
	drawPaddle(player1);
	drawPaddle(player2);
	drawBall(ball);
	displayScore();

	if (!gameRunning) { return; }
	// Update game state
	movePaddlesPlayer1();
	movePaddlesPlayer2();
	updatePaddle(player1);
	updatePaddle(player2);
	updateBall();
	gameRunning = updateScoreUserVsUser();
	requestAnimationFrame(gameLoopUserVsUser);
}