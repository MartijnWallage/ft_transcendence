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
	console.log(`Game starting in mode: ${mode}`);
}

function endGame() {
	var redirecturi = "/";
	window.location.href = redirecturi;
}

function startGameUserVsUser() {
	const player2Name = document.getElementById('player2Name').value;
	if (player2Name.trim() === '') {
		alert('Please enter a valid name for Player 2');
	} else {
		const player1Name = '{{ user.username|default:"Guest" }}';
		startGame(player1Name, player2Name, 'user-vs-user');
	}
}

function startGameSolo() {
	startGame('Player 1', 'Computer', 'user-vs-computer');
}

function startTournament() {
	if (gameState.players.length < 2) {
		alert('Please add at least 2 players to start the tournament.');
		return;
	}
	initializeTournament();
}

export {startGameUserVsUser, startGameSolo, startGame, endGame, startTournament};
