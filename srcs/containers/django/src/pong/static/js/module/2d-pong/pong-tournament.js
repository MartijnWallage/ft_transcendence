import { resetBall, displayScore } from './pong-core.js';
import {canvas, ctx, ball, scoreToWin} from './pong-conf.js';
import { gameState } from './game-state.js';

function displayScoreTournament() {
	displayScore();
	ctx.fillText( `${gameState.players[gameState.matchOrder[gameState.currentGameIndex - 1][0]]} Score: ` + gameState.player1Score, 20, 30);
	ctx.fillText( `${gameState.players[gameState.matchOrder[gameState.currentGameIndex - 1][1]]} Score: ` + gameState.player2Score, canvas.width - 180, 30);
}

function updateScoreTournament() {
    if (ball.x < 0) {
        gameState.player2Score += 1;
        resetBall();
    } else if (ball.x + ball.width > canvas.width) {
        gameState.player1Score += 1;
        resetBall();
    }

    if (gameState.player1Score === scoreToWin || gameState.player2Score === scoreToWin) {
		console.log('player1: ', gameState.players[gameState.matchOrder[gameState.currentGameIndex - 1][0]]);
		console.log('player2: ', gameState.players[gameState.matchOrder[gameState.currentGameIndex - 1][1]]);
		if (gameState.player1Score == scoreToWin) {
			alert(`${gameState.players[gameState.matchOrder[gameState.currentGameIndex - 1][0]]} wins!`);
			return false;
		}
		else {
			alert(`${gameState.players[gameState.matchOrder[gameState.currentGameIndex - 1][1]]} wins!`);
			return false;
		}
    }
	return true;
}

export { displayScoreTournament, updateScoreTournament };