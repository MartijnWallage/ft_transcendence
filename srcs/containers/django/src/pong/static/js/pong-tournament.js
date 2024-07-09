let gameRunning = true;

function displayScoreTournament() {
	displayScore();
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