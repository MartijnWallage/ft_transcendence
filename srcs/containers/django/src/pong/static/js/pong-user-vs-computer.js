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
    if (player1Score === scoreToWin){
        setTimeout(function() {
            alert('Player 1 wins!');
            console.log('Player 1 wins!');
        }, 100);
        return false;
	}
	else if (player2Score === scoreToWin){
        setTimeout(function() {
            alert('Player 2 wins!');
            console.log('Player 2 wins!');
        }, 100);
        return false;
	}
    return true;
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
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw net, paddles, and ball
    drawNet();
    drawPaddle(player1);
    drawPaddle(player2);
    drawBall(ball);
    displayScoreUserVsComputer();
    
    if (!gameRunning) return;
    
    // Update game state
    movePaddlesPlayer1();
    movePaddlesComputer();
    updatePaddle(player1);
    updatePaddle(player2);
    updateBall();
    gameRunning = updateScoreUserVsComputer();
    requestAnimationFrame(gameLoopUserVsComputer);  

}
