import { displayPlayers, initializeTournament } from './tournament-init.js';
import { gameLoop } from './pong-core.js';
import { gameState } from './game-state.js';

function startGameUserVsUser() {
	const player2Name = document.getElementById('player2Name').value;
	if (player2Name.trim() === '') {
	  alert('Please enter a valid name for Player 2');
	} else {
	  // loadPage('pong')
	  const player1Name = '{{ user.username|default:"Guest" }}';
	  startGame(player1Name, player2Name, 'user-vs-user');
	}
}

function addPlayer() {
    const playerName = document.getElementById('playerNameInput').value.trim();
	console.log(playerName);
    if (playerName === '') {
        alert('Please enter a valid name.');
        return;
    }
    gameState.players.push(playerName);
    displayPlayers();
    document.getElementById('playerNameInput').value = '';
}

function startTournament() {
    if (gameState.players.length < 2) {
        alert('Please add at least 2 players to start the tournament.');
        return;
    }
	initializeTournament();
}

function startGame(player1Name, player2Name, mode) {
	document.getElementById('pongCanvas').style.display = 'block';
    console.log(`Starting game: ${player1Name} vs ${player2Name}`);
	gameState.player1Score = 0;
	gameState.player2Score = 0;
	gameState.gameRunning = true;
	console.log(`Game mode: ${mode}`);
	if (mode === 'tournament') {
		gameLoop(mode);
	}
	else if (mode === 'user-vs-user') {
		gameLoop(mode);
	}
	else if (mode === 'user-vs-computer') {
		console.log('Starting game in user vs computer mode');
		gameLoop(mode);
	}
}

function startGameSolo() {
	startGame('Player 1', 'Computer', 'user-vs-computer');
}

function endGame() {
	var redirecturi = "/";
	window.location.href = redirecturi;
}


export {startGameUserVsUser, startGameSolo, startGame, endGame, addPlayer, startTournament};

window.startGameUserVsUser = startGameUserVsUser;
window.addPlayer = addPlayer;
window.startGame = startGame;
window.endGame = endGame;
// window.startGameSolo = startGameSolo;
window.startTournament = startTournament;