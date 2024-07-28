import Stats from './three-lib/stats.module.js'
import { Game } from './classes/Game.js';
import { gameState } from './game-state.js';
import { update } from './update.js'
import { endGame, startGameUserVsUser, startGameSolo, startTournament } from "../game/start-end-game.js";
import { addPlayer } from '../game/tournament.js';

function main() {
	// page loading
	window.onpopstate = (event) => {
		const page = event.state ? event.state.page : 'home';
		window.loadPage(page);
	};
	
	// Loading the home page on document ready
	document.addEventListener('DOMContentLoaded', () => {
		const page = location.hash.replace('#', '') || 'home';
		window.loadPage(page);
	});
	
	// FPS stats viewer
	//	const stats = new Stats();
	//	stats.showPanel(0);
	//	document.body.appendChild(stats.dom);
	
	//key listener
	let keys = {};
	document.addEventListener("keydown", (event) => { 
		keys[event.key] = true; 
	});
	
	document.addEventListener("keyup", (event) => {
		keys[event.key] = false;
	});
	
	
	const container = document.getElementById('threejs-container');
	const game = new Game(container);
	window.addEventListener('resize', () => game.onWindowResize(gameState));
	bindEventListeners(game);
	requestAnimationFrame(animate.bind(null, keys, game));
}

function animate(keys, game) {
//	stats.begin(); // for the FPS stats
	update(keys, game);
	game.controls.update();
	requestAnimationFrame(animate.bind(null, keys, game));
//	stats.end(); // for the FPS stats
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

window.loadPage = async (page) => {
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
        
    } catch (error) {
        console.error('Error loading page:', error);
        throw error;
    }
};

/* window.loadPage = (page, game) => {
	return new Promise((resolve, reject) => {
		const mainContent = document.getElementById('main-content');
		const underTitle = document.getElementById('under-title');
  
		const updateContent = () => {
		fetch('/api/' + page + '/')
			.then(response => response.json())
			.then(data => {
			mainContent.innerHTML = data.content;
			history.pushState({ page: page }, "", "#" + page);
			bindEventListeners(game);
  
			const updatedUnderTitle = document.getElementById('under-title');
			if (updatedUnderTitle) {
				fadeIn(updatedUnderTitle).then(resolve);
			} else {
				resolve();
			}
			})
			.catch(error => {
			console.error('Error loading page:', error);
			reject(error);
			});
		};

		if (underTitle) {
			fadeOut(underTitle).then(updateContent);
		} else {
			updateContent();
		}
	});
}; */

function bindEventListeners(game) {
	var leaderBoardButton = document.getElementById('js-leaderboard-btn');
	if (leaderBoardButton) {
	  leaderBoardButton.addEventListener('click', showLeaderBoard);
	}
	var leaderBoardClose = document.getElementById('js-leaderboard-close');
	if (leaderBoardClose) {
	  leaderBoardClose.addEventListener('click', hideLeaderBoard);
	}
	var startUserVsUserButton = document.getElementById('js-start-user-vs-user-btn');
	if (startUserVsUserButton) {
	  startUserVsUserButton.addEventListener('click', startGameUserVsUser.bind(null, game));
	}
	var addPlayerBtn = document.getElementById('js-add-player-btn');
	if (addPlayerBtn) {
	  addPlayerBtn.addEventListener('click', addPlayer.bind(null, game));
	}
	var gameSoloBtn = document.getElementById('js-start-game-solo-btn');
	if (gameSoloBtn) {
		gameSoloBtn.addEventListener('click', startGameSolo.bind(null, game));
	}
	var startTournamentBtn = document.getElementById('js-start-tournament-btn');
	if (startTournamentBtn) {
	  startTournamentBtn.addEventListener('click', startTournament.bind(null, game));
	}
	var startTournamentBtn = document.getElementById('js-end-game-btn');
	if (startTournamentBtn) {
	  startTournamentBtn.addEventListener('click', endGame.bind(null, game));
	}
}

function showLeaderBoard() {
	var leaderBoardDiv = document.getElementById('js-leaderboard-div');
	if (leaderBoardDiv)
		leaderBoardDiv.style.display = 'block';
	var leaderBoardButton = document.getElementById('js-leaderboard-btn');
	if (leaderBoardButton)
		leaderBoardButton.style.display = 'none';
}

function hideLeaderBoard() {
	var leaderBoardDiv = document.getElementById('js-leaderboard-div');
	if (leaderBoardDiv)
		leaderBoardDiv.style.display = 'none';
	var leaderBoardButton = document.getElementById('js-leaderboard-btn');
	if (leaderBoardButton)
		leaderBoardButton.style.display = 'block';
}

main();
