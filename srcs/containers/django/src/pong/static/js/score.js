import { nextGame } from './tournament.js';
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

function isScore(court, ball) {
    const halfFieldWidth = court.geometry.parameters.width / 2;
    const ballRightSide = ball.position.x + ball.radius;
    const ballLeftSide = ball.position.x - ball.radius;

    return ballRightSide < -halfFieldWidth ? 1 :
        ballLeftSide > halfFieldWidth ? 0 :
        -1;
}

async function updateScore(game) {
    const court = game.field;
    const ball = game.ball;

    const player = isScore(court, ball);
    if (player === -1) return;

    game.playerScores[player] += 1;
    textToDiv(game.playerScores[player], `player${player + 1}-score`);
    ball.serveBall();

    const winner = game.isWinner();
    if (winner === -1) return;

    game.running = false;
    ball.resetBall();
    await displayWinMessage(`Player ${winner + 1} wins!`);
    if (game.mode != 'tournament') {
        game.endGame();
        return ;
    }
    game.scoreBoard[game.matchOrder[game.currentGameIndex - 1][winner]] += 1;
    game.matchResult.push(game.playerScores);
    console.log('number of victory player ' +
        game.matchOrder[game.currentGameIndex - 1][winner] +
        ' :' + 
        game.scoreBoard[game.matchOrder[game.currentGameIndex - 1][winner]]);
    nextGame(game);
}

export { updateScore };