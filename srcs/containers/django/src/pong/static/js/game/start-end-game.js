import { gameState } from './game-state.js';
import { ball } from './update.js';
import { initializeTournament } from './tournament.js';
import { getRandomInt, textToDiv, HTMLToDiv } from './game-utils.js';

function waitForEnter(enter) {
	return new Promise((resolve) => {
		function onKeyDown(event) {
			if (event.key === 'Enter') {
				document.removeEventListener('keydown', onKeyDown);
				enter.style.display = 'none';
				resolve();
			}
		}
		document.addEventListener('keydown', onKeyDown);
	});
}

function countdown(seconds, announcement) {
	return new Promise(resolve => {
		announcement.innerHTML = seconds;
		const interval = setInterval(() => {
			announcement.innerHTML = seconds;
			seconds -= 1;
			if (seconds < 0) {
				clearInterval(interval);
				resolve();
			}
		}, 600);
	});
}

async function startGame(player1Name, player2Name, mode) {
	console.log(`Starting game: ${player1Name} vs ${player2Name}`);
	HTMLToDiv(`${player1Name}<br>VS<br>${player2Name}`, 'announcement');
	gameState.player1Score = 0;
	gameState.player2Score = 0;
	gameState.running = true;
	gameState.mode = mode;

	const enter = document.getElementById('enter');
	enter.style.display = 'block';
	await waitForEnter(enter);
	await countdown(3, announcement);
	const menu = document.getElementById('menu');
	menu.classList.add('fade-out');
	setTimeout(function() {
		menu.classList.add('hidden');
	}, 1500); 
	
	ball.serve = getRandomInt(0, 2) ? 1 : -1;
	ball.serveBall();
	textToDiv('0', 'player1-score');
	textToDiv(player1Name, 'player1-name');
	textToDiv('0', 'player2-score');
	textToDiv(player2Name, 'player2-name');
	console.log(`Game starting in mode: ${mode}`);
}

function endGame() {
	var redirecturi = "/#home";
	window.location.href = redirecturi;
}

async function startGameUserVsUser() {
	const player2Name = document.getElementById('player2Name').value;
	var error = document.getElementById('error');
	if (player2Name.trim() === '') {
		error.style.display = 'block'; 
		return;
	} else {
		try {
		await loadPage('pong');
			startGame('Guest', player2Name, 'user-vs-user');
		} catch (error) {
			console.error('Error starting game:', error);
		}
	}
}

async function startGameSolo() {
	try {
		await loadPage('pong');
		startGame('Guest', 'pongAI', 'user-vs-computer');
	} catch (error) {
		console.error('Error starting game:', error);
	}
}

async function startTournament() {
	if (gameState.players.length < 2) {
		var error2 = document.getElementById('error2');
		error2.style.display = 'block'; 
		return;
	}
	try {
		await loadPage('pong');
		initializeTournament();
	} catch (error) {
		console.error('Error starting game:', error);
	}
}

export {startGameUserVsUser, startGameSolo, startGame, endGame, startTournament};
