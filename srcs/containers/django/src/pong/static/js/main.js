import { displayPlayers, initializeTournament } from './tournament-init.js';
import { gameLoop } from './pong_core.js';

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
    if (playerName === '') {
        alert('Please enter a valid name.');
        return;
    }
    players.push(playerName);
    displayPlayers();
    document.getElementById('playerNameInput').value = '';
}

function startTournament() {
    if (players.length < 2) {
        alert('Please add at least 2 players to start the tournament.');
        return;
    }
	initializeTournament();
}

function startGame(player1Name, player2Name, mode) {
	document.getElementById('pongCanvas').style.display = 'block';
    console.log(`Starting game: ${player1Name} vs ${player2Name}`);
	player1Score = 0;
	player2Score = 0;
	gameRunning = true;
	console.log(`Game mode: ${mode}`);
	if (mode === 'tournament') {
		gameLoop(mode);
	}
	else if (mode === 'user-vs-user') {
		gameLoop(mode);
	}
	else if (mode === 'user-vs-computer') {
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

let players = [];
let matchOrder = [];
let currentGameIndex = 0;

let player1Score = 0;
let player2Score = 0;
let gameRunning = true;

export {startGameUserVsUser, startGameSolo, startGame, endGame, addPlayer, startTournament, players, matchOrder, currentGameIndex, player1Score, player2Score, gameRunning};

window.startGameUserVsUser = startGameUserVsUser;
window.addPlayer = addPlayer;
window.startGame = startGame;
window.endGame = endGame;
window.startGameSolo = startGameSolo;
window.startTournament = startTournament;

window.players = players;
window.matchOrder = matchOrder;
window.currentGameIndex = currentGameIndex;

window.player1Score = player1Score;
window.player2Score = player2Score;
window.gameRunning = gameRunning;