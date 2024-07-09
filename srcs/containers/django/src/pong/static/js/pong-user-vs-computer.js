import { drawPaddle, drawBall, drawNet, updatePaddle, updateBall, resetBall, movePaddlesPlayer1, displayScore } from './pong_core.js';
import {canvas, ctx, player1, player2, ball, scoreToWin, paddleSpeed} from './pong-conf.js';

function updateScoreUserVsComputer() {
    if (ball.x < player1.x) {
        player2Score += 1;
        resetBall();
    } else if (ball.x > player2.x + player2.width) {
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
    displayScore();
    
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

export { gameLoopUserVsComputer };
