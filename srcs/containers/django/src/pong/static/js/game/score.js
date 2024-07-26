import { ball } from './update.js';
import { gameState, isWinner } from './game-state.js';
import { nextGame } from './tournament.js';
import { endGame } from './start-end-game.js';
import { textToDiv } from './utils.js';

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

function isScore(court) {
    const halfFieldWidth = court.geometry.parameters.width / 2;
    const ballRightSide = ball.position.x + ball.radius;
    const ballLeftSide = ball.position.x - ball.radius;

    return ballRightSide < -halfFieldWidth ? 1 :
        ballLeftSide > halfFieldWidth ? 0 :
        -1;
}

async function updateScore(court) {
    let player;
    if ((player = isScore(court)) === -1) {
        return;
    }

    gameState.playerScores[player] += 1;
    textToDiv(gameState.playerScores[player], `player${player + 1}-score`);
    ball.serveBall();

    let winner;
    if ((winner = isWinner()) === -1) {
        return;
    }

    gameState.running = false;
    ball.resetBall();
    await displayWinMessage(`Player ${winner + 1} wins!`);
    if (gameState.mode === 'tournament'){
        gameState.scoreBoard[gameState.matchOrder[gameState.currentGameIndex - 1][winner]] += 1;
        gameState.matchResult.push(gameState.playerScores);
        console.log('number of victory player ' + gameState.matchOrder[gameState.currentGameIndex - 1][winner] + ' :' + gameState.scoreBoard[gameState.matchOrder[gameState.currentGameIndex - 1][winner]]);
        nextGame();
        return;
    }
    endGame();
}

export { updateScore };