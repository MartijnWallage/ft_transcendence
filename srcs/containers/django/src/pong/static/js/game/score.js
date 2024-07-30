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
    const player = isScore(court);
    if (player === -1) return;

    gameState.playerScores[player] += 1;
    textToDiv(gameState.playerScores[player], `player${player + 1}-score`);
    ball.serveBall();

    const winner = isWinner();
    if (winner === -1) return;

    gameState.running = false;
    ball.resetBall();
    await displayWinMessage(`Player ${winner + 1} wins!`);
    if (gameState.mode === 'tournament') {
        const match = {
            player1: gameState.player1,
            player2: gameState.player2,
            score1: gameState.playerScores[0],
            score2: gameState.playerScores[1],
            timestamp: Date.now()
        };
        gameState.matchResult.push(match);
        console.log('Match:', gameState.matchResult);
        nextGame();
        return;
    }
    endGame();
}

export { updateScore };