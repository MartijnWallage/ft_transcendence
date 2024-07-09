import {gameLoopUserVsUser} from './pong-user-vs-user.js';
import {gameLoopUserVsComputer} from './pong-user-vs-computer.js';
import {gameLoopTournament} from './pong-tournament.js';
import { displayPlayers } from './tournament-init.js';

// import { player1Score, player2Score, gameRunning } from './pong-conf.js';

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
		gameLoopTournament();
	}
	else if (mode === 'user-vs-user') {
		gameLoopUserVsUser();
	}
	else if (mode === 'user-vs-computer') {
		gameLoopUserVsComputer();
	}
}



function endGame() {
	var redirecturi = "/";
	window.location.href = redirecturi;
}

let players = [];
let matchOrder = [];
let currentGameIndex = 0;

export {startGameUserVsUser, startGame, endGame, addPlayer, startTournament, players, matchOrder, currentGameIndex};

window.startGameUserVsUser = startGameUserVsUser;
window.addPlayer = addPlayer;
window.startGame = startGame;
window.endGame = endGame;
window.startTournament = startTournament;

window.players = players;
window.matchOrder = matchOrder;
window.currentGameIndex = currentGameIndex;