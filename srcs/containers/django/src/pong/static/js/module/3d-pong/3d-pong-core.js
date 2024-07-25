import { paddle_p1, paddle_p2, ball, field, keys } from './3d-app.js';
import { gameState } from './3d-game-state.js';
import { nextGame } from './3d-tournament.js';
import { endGame } from './3d-game.js';

function displayWinMessage(message) {
	var announcement = document.getElementById('announcement');
	announcement.textContent = message;
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
	if (ball.position.x + ball.radius < -field.geometry.parameters.width / 2) {
		gameState.player2Score += 1;
		var p2Score = document.getElementById('player2-score');
		p2Score.textContent = gameState.player2Score;
		console.log("one point for player 2");
		ball.serveBall();
	} else if (ball.position.x - ball.radius > field.geometry.parameters.width / 2) {
		gameState.player1Score += 1;
		var p1Score = document.getElementById('player1-score');
		p1Score.textContent = gameState.player1Score;
		console.log("one point for player 1");
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
		
	}
	else if (gameState.player2Score === gameState.scoreToWin){
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