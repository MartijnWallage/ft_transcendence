import { gameState } from './3d-game-state.js';
import { serveBall } from './3d-pong-core.js';
import { initializeTournament } from './3d-tournament.js';

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
	const announcement = document.getElementById('announcement');
	announcement.innerHTML = `${player1Name}<br>VS<br>${player2Name}`;
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
	
	serveBall();
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
