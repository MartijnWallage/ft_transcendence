import { paddle_p1, paddle_p2, ball, field, keys } from './update.js';
import { gameState } from './game-state.js';
import { nextGame } from './tournament.js';
import { endGame } from './start-end-game.js';
import { textToDiv, HTMLToDiv } from './game-utils.js';

function displayWinMessage(message) {
	textToDiv(message, 'announcement');
	var menu = document.getElementById('menu');
	menu.style.display = 'block';
	menu.style.opacity = 1;
	const btn = document.getElementById('js-next-game-btn');
	btn.style.display = 'block';
	return new Promise((resolve) => {
		function onClick(event) {
			btn.removeEventListener('click', onClick);
			btn.style.display = 'none';
			resolve(event); 
		}
		document.addEventListener('click', onClick);
	});
}

async function updateScore(field) {
    const halfFieldWidth = field.geometry.parameters.width / 2;
    const ballRightSide = ball.position.x + ball.radius;
    const ballLeftSide = ball.position.x - ball.radius;

	if (ballRightSide < -halfFieldWidth) {
		gameState.player2Score += 1;
		textToDiv(gameState.player2Score, 'player2-score');
		ball.serveBall();
	} else if (ballLeftSide > halfFieldWidth) {
		gameState.player1Score += 1;
        textToDiv(gameState.player1Score, 'player1-score');
		ball.serveBall();
	}

	if (gameState.player1Score === gameState.scoreToWin) {
		gameState.running = false;
		ball.resetBall();
		await displayWinMessage('Player 1 wins!');
		if (gameState.mode === 'tournament'){
			gameState.scoreBoard[gameState.matchOrder[gameState.currentGameIndex - 1][0]] += 1;
			console.log('number of victory player ' + gameState.matchOrder[gameState.currentGameIndex - 1][0] + ' :' + gameState.scoreBoard[gameState.matchOrder[gameState.currentGameIndex - 1][0]]);
			nextGame();
			return;
		}
		endGame();
	} else if (gameState.player2Score === gameState.scoreToWin){
		gameState.running = false;
		ball.resetBall();
		await displayWinMessage('Player 2 wins!');
		if (gameState.mode === 'tournament'){
			gameState.scoreBoard[gameState.matchOrder[gameState.currentGameIndex - 1][1]] += 1;
			console.log('number of victory player ' + gameState.matchOrder[gameState.currentGameIndex - 1][1] + ' :' + gameState.scoreBoard[gameState.matchOrder[gameState.currentGameIndex - 1][1]]);
			nextGame();
			return;
		}
		endGame();
	}
}

export { updateScore };