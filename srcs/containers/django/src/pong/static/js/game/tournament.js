import { gameState } from './game-state.js';
import { startGame, startTournament } from './start-end-game.js';
import { ball} from './update.js';
import { endTournament } from './tournament-end.js';



function addPlayer() {
	const playerName = document.getElementById('playerNameInput').value.trim();
	console.log(playerName);
	var error = document.getElementById('error');
	if (playerName === '') {
		error.style.display = 'block'; 
		return;
	}
	else {
		error.style.display = 'none'; 
	}
	gameState.players.push(playerName);
	displayPlayers();
	document.getElementById('playerNameInput').value = '';
}

function nextGame() {
	gameState.running = true;
	gameState.indexNewPlayer += 1;
	console.log('Index new player:', gameState.indexNewPlayer);
	if (gameState.indexNewPlayer >= gameState.players.length) {
		endTournament();
		return ;
	}
	if (gameState.playerScores[0] > gameState.playerScores[1]) {
		gameState.player2 = gameState.players[gameState.indexNewPlayer];
	}
	else {
		gameState.player1 = gameState.players[gameState.indexNewPlayer];
	}
	console.log('Next match:', gameState.player1, 'vs', gameState.player2);
	startGame(gameState.player1, gameState.player2, 'tournament');
}

function displayPlayers() {
	const playerListDiv = document.getElementById('playerList');
	playerListDiv.innerHTML = ''; // Clear existing list
	gameState.players.forEach(player => {
		let index = gameState.players.indexOf(player) + 1;
		let name = player;
		const playerElement = document.createElement('p');
		playerElement.textContent = `Player ${index}: ${name}`;
		playerListDiv.appendChild(playerElement);
	});
}

function initializeTournament() {
	gameState.matchResult = [];
	gameState.indexNewPlayer = 1;
	gameState.playerScores = [0, 0];
	gameState.player1 = gameState.players[0];
	gameState.player2 = gameState.players[1];
	console.log('Players:', gameState.players);
	console.log('Next match:', gameState.player1, 'vs', gameState.player2);
	startGame(gameState.player1, gameState.player2, 'tournament');
}


function displayScoreTournament() {
	displayScore();
	ctx.fillText( `${gameState.player1} Score: ` + gameState.playerScores[0], 20, 30);
	ctx.fillText( `${gameState.player2} Score: ` + gameState.playerScores[1], canvas.width - 180, 30);
}

function updateScoreTournament() {
	if (ball.x < 0) {
		gameState.playerScores[0] += 1;
		ball.resetBall();
	} else if (ball.x + ball.width > canvas.width) {
		gameState.playerScores[1] += 1;
		ball.resetBall();
	}

	if (gameState.playerScores[0] === gameState.scoreToWin || gameState.playerScores[1] === gameState.scoreToWin) {
		if (gameState.playerScores[0] == gameState.scoreToWin) {
			setTimeout(function() {
				alert(`${gameState.player1} wins!`);
			}
			, 100);
			return false;
		}
		else {
			setTimeout(function() {
				alert(`${gameState.player2} wins!`);
			}
			, 100);
			return false;
		}
	}
	return true;
}

export { addPlayer, displayPlayers, initializeTournament, displayScoreTournament, updateScoreTournament, nextGame };