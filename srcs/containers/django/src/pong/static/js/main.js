import Stats from './three-lib/stats.module.js'
import { Game } from './classes/Game.js';
import { update } from './update.js'
import { addPlayer, startTournament } from './tournament.js';

function main() {
	const container = document.getElementById('threejs-container');
	const this_game = new Game(container);

	// Making game object available for load page
	window.loadPage = loadPageClosure(this_game);

	// Popstate event listener
	window.onpopstate = function (event) {
		const page = event.state ? event.state.page : 'home';
		window.loadPage(page);
	};
	
	// Load homepage when document is ready
	const DOMContentLoadedHandler = function() {
		const page = location.hash.replace('#', '') || 'home';
		window.loadPage(page);
	};
	document.addEventListener('DOMContentLoaded', DOMContentLoadedHandler);
	
	// FPS stats viewer
	const stats = new Stats();
	stats.showPanel(0);
	document.body.appendChild(stats.dom);
	
	//key listener
	let keys = {};
	document.addEventListener("keydown", (event) => { 
		keys[event.key] = true; 
	});
	
	document.addEventListener("keyup", (event) => {
		keys[event.key] = false;
	});
	
	window.addEventListener('resize', () => this_game.onWindowResize());

	// main loop
	requestAnimationFrame(animate.bind(null, stats, keys, this_game));
}

function animate(stats, keys, game) {
	stats.begin(); // for the FPS stats
	update(keys, game);
	game.controls.update();
	requestAnimationFrame(animate.bind(null, stats, keys, game));
	stats.end(); // for the FPS stats
}

function fadeIn(element) {
	return new Promise((resolve) => {
		element.style.opacity = 0;
		element.style.display = 'block';
		element.offsetHeight; 
		element.style.transition = 'opacity 1s';
		element.style.opacity = 1;
		element.addEventListener('transitionend', function handler() {
			element.removeEventListener('transitionend', handler);
			resolve();
		}, { once: true });
	});
}

function fadeOut(element) {
	return new Promise((resolve) => {
		element.style.transition = 'opacity 1s';
		element.style.opacity = 0;
		element.addEventListener('transitionend', function handler() {
			element.removeEventListener('transitionend', handler);
			resolve();
		}, { once: true });
	});
}

function loadPageClosure(game) {
	return async (page) => {
		try {
			const mainContent = document.getElementById('main-content');
			const underTitle = document.getElementById('under-title');
			
			if (underTitle) {
				await fadeOut(underTitle);
			}
			
			const response = await fetch('/api/' + page + '/');
			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}
			
			const data = await response.json();
			mainContent.innerHTML = data.content;
			history.pushState({ page: page }, "", "#" + page);
			
			const updatedUnderTitle = document.getElementById('under-title');
			if (updatedUnderTitle) {
				await fadeIn(updatedUnderTitle);
			}
			bindEventListeners(game);
			
		} catch (error) {
			console.error('Error loading page:', error);
			throw error;
		}
	};
}

function bindEventListeners(game) {

	const leaderBoardButton = document.getElementById('js-leaderboard-btn');
	if (leaderBoardButton) {
		leaderBoardButton.addEventListener('click', showLeaderBoard);
	}

	const leaderBoardClose = document.getElementById('js-leaderboard-close');
	if (leaderBoardClose) {
		leaderBoardClose.addEventListener('click', hideLeaderBoard);
	}

	const startUserVsUserButton = document.getElementById('js-start-user-vs-user-btn');
	if (startUserVsUserButton) {
		startUserVsUserButton.addEventListener('click', game.startGame.bind(game, 'user-vs-user'));
	}

	const addPlayerBtn = document.getElementById('js-add-player-btn');
	if (addPlayerBtn) {
		addPlayerBtn.addEventListener('click', addPlayer.bind(null, game));
	}
	
	const gameSoloBtn = document.getElementById('js-start-game-solo-btn');
	if (gameSoloBtn) {
		gameSoloBtn.addEventListener('click', game.startGame.bind(game, 'user-vs-computer'));
	}
	
	let startTournamentBtn = document.getElementById('js-start-tournament-btn');
	if (startTournamentBtn) {
		startTournamentBtn.addEventListener('click', startTournament.bind(null, game));
	}

	startTournamentBtn = document.getElementById('js-end-game-btn');
	if (startTournamentBtn) {
	  startTournamentBtn.addEventListener('click', game.endGame.bind(game));
	}
}

function showLeaderBoard() {

	const leaderBoardDiv = document.getElementById('js-leaderboard-div');
	if (leaderBoardDiv)
		leaderBoardDiv.style.display = 'block';

	const leaderBoardButton = document.getElementById('js-leaderboard-btn');
	if (leaderBoardButton)
		leaderBoardButton.style.display = 'none';
}

function hideLeaderBoard() {

	const leaderBoardDiv = document.getElementById('js-leaderboard-div');
	if (leaderBoardDiv)
		leaderBoardDiv.style.display = 'none';

	const leaderBoardButton = document.getElementById('js-leaderboard-btn');
	if (leaderBoardButton)
		leaderBoardButton.style.display = 'block';
}

main();
