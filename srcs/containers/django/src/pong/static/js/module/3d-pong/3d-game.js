import { gameState } from './3d-game-state.js';
import { serveBall } from './3d-pong-core.js';
import { initializeTournament } from './3d-tournament.js';

function startGame(player1Name, player2Name, mode) {
	console.log(`Starting game: ${player1Name} vs ${player2Name}`);
	gameState.player1Score = 0;
	gameState.player2Score = 0;
	gameState.running = true;
	gameState.mode = mode;
	serveBall();
	function initializeGameElements() {
		var p1Score = document.getElementById('player1-score');
		p1Score.textContent = '0';
		var p1Name = document.getElementById('player1-name');
		p1Name.textContent = player1Name;
		var p2Score = document.getElementById('player2-score');
		p2Score.textContent = '0';
		var p2Name = document.getElementById('player2-name');
		p2Name.textContent = player2Name;
		console.log(`Game starting in mode: ${mode}`);
	}
	if (document.readyState === 'complete' || document.readyState === 'interactive') {
		initializeGameElements();
	} else {
		document.addEventListener('DOMContentLoaded', initializeGameElements);
	}
}

function endGame() {
	var redirecturi = "/#home";
	window.location.href = redirecturi;
}

function startGameUserVsUser() {
	const player2Name = document.getElementById('player2Name').value;
	var error = document.getElementById('error');
	if (player2Name.trim() === '') {
		error.style.display = 'block'; 
		return;
	} else {
		const player1Name = '{{ user.username|default:"Guest" }}';
		loadPage('pong');
		setTimeout(function() {
			startGame(player1Name, player2Name, 'user-vs-user');
		}, 500); // there got to be a better solution than this.
	}
}

function startGameSolo() {
	loadPage('pong');
		setTimeout(function() {
			startGame('Player 1', 'Computer', 'user-vs-computer');
		}, 500); // there got to be a better solution than this. 
}

function startTournament() {
	if (gameState.players.length < 2) {
		alert('Please add at least 2 players to start the tournament.');
		return;
	}
	loadPage('pong');
		setTimeout(function() {
			initializeTournament();
		}, 500); // there got to be a better solution than this.
}

export {startGameUserVsUser, startGameSolo, startGame, endGame, startTournament};
