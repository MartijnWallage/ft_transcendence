import { registerMatches } from './tournament-score-blockchain.js';

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
		startUserVsUserButton.addEventListener('click', game.startUserVsUser.bind(game));
	}
	
	const addPlayerBtn = document.getElementById('js-add-player-btn');
	if (addPlayerBtn) {
		game.createTournament();
		console.log('adding player');
		addPlayerBtn.addEventListener('click', game.tournament.addPlayer.bind(game.tournament));
	}
	
	const gameSoloBtn = document.getElementById('js-start-game-solo-btn');
	if (gameSoloBtn) {
		gameSoloBtn.addEventListener('click', game.startSolo.bind(game));
	}
	
	let startTournamentBtn = document.getElementById('js-start-tournament-btn');
	if (startTournamentBtn) {
		console.log('creating tournament');
		startTournamentBtn.addEventListener('click', game.tournament.start.bind(game.tournament));
	}

	let endGameBtn = document.getElementById('js-end-game-btn');
	if (endGameBtn) {
		endGameBtn.addEventListener('click', game.endGame.bind(game));
	}
	
	var blockchainScore = document.getElementById('js-register-blockchain');
	if (blockchainScore) {
		blockchainScore.addEventListener('click', registerMatches.bind(null, game.tournament));
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
export { loadPageClosure };