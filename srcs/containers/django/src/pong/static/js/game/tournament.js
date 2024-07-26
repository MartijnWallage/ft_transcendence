import { gameState } from './game-state.js';
import { startGame } from './start-end-game.js';
import { ball} from './update.js';
import {endTournament} from './tournament-end.js';

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
	gameState.currentGameIndex += 1;
	console.log('Game index:', gameState.currentGameIndex);
	console.log('Match order length:', gameState.matchOrder.length);
	if (gameState.currentGameIndex > gameState.matchOrder.length) {
		endTournament();
		return ;
	}
	const player1 = gameState.players[gameState.matchOrder[gameState.currentGameIndex - 1][0]];
	const player2 = gameState.players[gameState.matchOrder[gameState.currentGameIndex - 1][1]];
	console.log('Next match:', player1, 'vs', player2);
	startGame(player1, player2, 'tournament');
}

function displayPlayers() {
	const playerListDiv = document.getElementById('playerList');
	playerListDiv.innerHTML = ''; // Clear existing list
	console.log('Players:', gameState.players);
	gameState.players.forEach(player => {
		let index = gameState.players.indexOf(player) + 1;
		let name = player;
		const playerElement = document.createElement('p');
		playerElement.textContent = `Player ${index}: ${name}`;
		playerListDiv.appendChild(playerElement);
	});
}

function matchOrderInit() {
	for (let i = 0; i < gameState.players.length; i++) {
		for (let j = i + 1; j < gameState.players.length; j++) {
			gameState.matchOrder.push([i, j]);
		}
	}
	console.log('Match order:', gameState.matchOrder);
}

function scoreBoardInit() {
	for (let i = 0; i < gameState.players.length; i++) {
		gameState.scoreBoard.push(0);
	}
}

function initializeTournament() {
	console.log('Players:', gameState.players); 
	// document.getElementById('announcement').innerText = `Next match: ${player1} vs ${player2}`;
	// document.getElementById('announcement').style.display = 'block';
	matchOrderInit();    
	scoreBoardInit();
	nextGame();
	console.log('Players length:', gameState.players.length);
}


function displayScoreTournament() {
	displayScore();
	ctx.fillText( `${gameState.players[gameState.matchOrder[gameState.currentGameIndex - 1][0]]} Score: ` + gameState.playerScores[0], 20, 30);
	ctx.fillText( `${gameState.players[gameState.matchOrder[gameState.currentGameIndex - 1][1]]} Score: ` + gameState.playerScores[1], canvas.width - 180, 30);
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
				alert(`${gameState.players[gameState.matchOrder[gameState.currentGameIndex - 1][0]]} wins!`);
			}
			, 100);
			return false;
		}
		else {
			setTimeout(function() {
				alert(`${gameState.players[gameState.matchOrder[gameState.currentGameIndex - 1][1]]} wins!`);
			}
			, 100);
			return false;
		}
	}
	return true;
}

export { addPlayer, displayPlayers, initializeTournament, displayScoreTournament, updateScoreTournament, nextGame };