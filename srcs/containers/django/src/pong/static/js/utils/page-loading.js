// import { addPlayer, startGameUserVsUser, startGameSolo, startTournament } from "../module/2d-pong/entrypoint.js";
import { endGame, startGameUserVsUser, startGameSolo, startTournament } from "../module/3d-pong/3d-game.js";
import { addPlayer } from '../module/3d-pong/3d-tournament.js';

window.loadPage = (page) => {
	return new Promise((resolve, reject) => {
		fetch('/api/' + page + '/')
			.then(response => response.json())
			.then(data => {
				document.getElementById('main-content').innerHTML = data.content;
				history.pushState({ page: page }, "", "#" + page);
				bindEventListeners();
				resolve();  // Resolve the promise after everything is done
			})
			.catch(error => {
				console.error('Error loading page:', error);
				reject(error);  // Reject the promise on error
			});
	});
};

window.loadPage = loadPage;

window.onpopstate = (event) => {
if (event.state)
	loadPage(event.state.page);
else
	loadPage('home'); // Default page
};


// Example of loading the home page on document ready
document.addEventListener('DOMContentLoaded', () => {
	const page = location.hash.replace('#', '') || 'home';
	loadPage(page);
});


function bindEventListeners() {
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
	  startUserVsUserButton.addEventListener('click', startGameUserVsUser);
	}
	var addPlayerBtn = document.getElementById('js-add-player-btn');
	if (addPlayerBtn) {
	  addPlayerBtn.addEventListener('click', addPlayer);
	}
	var gameSoloBtn = document.getElementById('js-start-game-solo-btn');
	if (gameSoloBtn) {
		gameSoloBtn.addEventListener('click', startGameSolo);
	}
	var startTournamentBtn = document.getElementById('js-start-tournament-btn');
	if (startTournamentBtn) {
	  startTournamentBtn.addEventListener('click', startTournament);
}
	var startTournamentBtn = document.getElementById('js-end-game-btn');
	if (startTournamentBtn) {
	  startTournamentBtn.addEventListener('click', endGame);
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