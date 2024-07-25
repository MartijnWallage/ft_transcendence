import { paddle_p1, paddle_p2, ball, field, keys } from './app.js';
import { gameState } from './game-state.js';
import { nextGame } from './tournament.js';
import { endGame } from './game.js';
import { textToDiv, HTMLToDiv } from './utils.js';

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
	if (ball.position.x + ball.radius < -field.geometry.parameters.width / 2) {
		gameState.player2Score += 1;
		textToDiv(gameState.player2Score, 'player2-score');
		console.log("one point for player 2");
		ball.serveBall();
	} else if (ball.position.x - ball.radius > field.geometry.parameters.width / 2) {
		gameState.player1Score += 1;
		textToDiv(gameState.player1Score, 'player1-score');
		console.log("one point for player 1");
		ball.serveBall();
	}

	if (gameState.player1Score === gameState.scoreToWin) {
		gameState.running = false;
		ball.resetBall();
		await displayWinMessage('Player 1 wins!');
		if (gameState.mode === 'tournament'){
			gameState.scoreBoard[gameState.matchOrder[gameState.currentGameIndex - 1][0]] += 1;
			gameState.matchResult.push( [gameState.player1Score, gameState.player2Score] );
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
			gameState.matchResult.push( [gameState.player1Score, gameState.player2Score] );
			console.log('number of victory player ' + gameState.matchOrder[gameState.currentGameIndex - 1][1] + ' :' + gameState.scoreBoard[gameState.matchOrder[gameState.currentGameIndex - 1][1]]);
			nextGame();
			return;
		}
		endGame();
	}
}

export { updateScore };