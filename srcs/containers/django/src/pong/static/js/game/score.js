import { ball } from './update.js';
import { gameState } from './game-state.js';
import { nextGame } from './tournament.js';
import { endGame } from './start-end-game.js';
import { textToDiv } from './game-utils.js';

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
    } else if (ballLeftSide > halfFieldWidth) {
        gameState.player1Score += 1;
        textToDiv(gameState.player1Score, 'player1-score');
    } else {
        return;
    }

    ball.serveBall();

    const winner = gameState.player1Score === gameState.scoreToWin ? 1 :
        gameState.player2Score === gameState.scoreToWin ? 2 :
        null;

    if (winner === null) return;

    gameState.running = false;
    ball.resetBall();
    await displayWinMessage(`Player ${winner} wins!`);
    if (gameState.mode === 'tournament'){
        gameState.scoreBoard[gameState.matchOrder[gameState.currentGameIndex - 1][winner - 1]] += 1;
        console.log('number of victory player ' + gameState.matchOrder[gameState.currentGameIndex - 1][winner - 1] + ' :' + gameState.scoreBoard[gameState.matchOrder[gameState.currentGameIndex - 1][winner - 1]]);
        nextGame();
        return;
    }
    endGame();
}

export { updateScore };