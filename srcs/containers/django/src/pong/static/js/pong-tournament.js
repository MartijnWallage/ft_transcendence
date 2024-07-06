let gameRunning = true;

function displayScoreTournament() {
    ctx.font = "20px Arial";
    ctx.fillStyle = "white";
	ctx.fillText( `${players[matchOrder[currentGameIndex - 1][0]]} Score: ` + player1Score, 20, 30);
	ctx.fillText( `${players[matchOrder[currentGameIndex - 1][1]]} Score: ` + player2Score, canvas.width - 180, 30);
}

function updateScoreTournament() {
    if (ball.x < 0) {
        player2Score += 1;
        resetBall();
    } else if (ball.x + ball.width > canvas.width) {
        player1Score += 1;
        resetBall();
    }

    if (player1Score === scoreToWin || player2Score === scoreToWin) {
		if (player1Score == scoreToWin) {
			setTimeout(function() {
				alert(`${players[matchOrder[currentGameIndex - 1][0]]} wins!`);
			}
			, 100);
			return false;
		}
		else {
			setTimeout(function() {
				alert(`${players[matchOrder[currentGameIndex - 1][1]]} wins!`);
			}
			, 100);
			return false;
		}
    }
	return true;
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx *= -1; // Change ball direction
    ball.dy = ball.dx / 2;
}



function gameLoopTournament() {
	// Clear the canvas
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Draw net, paddles, and ball
	drawNet();
	drawPaddle(player1);
	drawPaddle(player2);
	drawBall(ball);
	displayScoreTournament();

    if (!gameRunning){ 
		player1Score = 0;
		player2Score = 0;
		if (player1Score === scoreToWin) {
			scoreBoard[matchOrder[currentGameIndex - 1][0]] += 1;
			console.log('number of victory player ' + matchOrder[currentGameIndex - 1][0] + ' :' + scoreBoard[matchOrder[currentGameIndex - 1][0]]);
		} else {
			scoreBoard[matchOrder[currentGameIndex - 1][1]] += 1;
			console.log('number of victory player ' + matchOrder[currentGameIndex - 1][1] + ' :' + scoreBoard[matchOrder[currentGameIndex - 1][1]]);
		}
		nextGame();
		return; 
	}
	// Update game state
	movePaddlesPlayer1();
	movePaddlesPlayer2();
	updatePaddle(player1);
	updatePaddle(player2);
	updateBall();
	gameRunning = updateScoreTournament();
	requestAnimationFrame(gameLoopTournament);
}
