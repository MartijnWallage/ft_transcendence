import { updateUI, bindUserEventListeners, handleLogout} from './userMgmt.js';
import { showMatches, showTournaments } from './match-history.js';

function loadPageClosure(game) {
	return async (page) => {
		console.log("loading page :", page);
		if (game.audio && page != 'pong') {
			game.audio.playSound(game.audio.select_1);
		}
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
			console.log('LOG: Page content loaded:', page);
			history.pushState({ page: page }, "", "#" + page);
			
			const updatedUnderTitle = document.getElementById('under-title');
			if (updatedUnderTitle) {
				await fadeIn(updatedUnderTitle);
			}
			await updateUI(game);
			console.log('Page UI updated:', page);
			bindUserEventListeners(mainContent, page);
			bindEventListeners(game);
			if (page === 'match_history') {
				// document.getElementById('lastModified').textContent = new Date(document.lastModified).toLocaleString();
				dropDownEventListeners();
			}
			
		} catch (error) {
			console.error('Error loading page:', error);
			throw error;
		}
	};
}

const IdleTimerModule = (() => {
	let idleTime = 0;
	const maxIdleTime = 5 * 60 * 1000;

	const resetIdleTimer = () => {
		clearTimeout(idleTime);
		startIdleTimer();
	};

	const startIdleTimer = () => {
		idleTime = setTimeout(handleLogout, maxIdleTime);
	};

	return {
		init: () => {
			window.onload = resetIdleTimer;
			document.onmousemove = resetIdleTimer;
			document.onkeydown = resetIdleTimer;
			document.onkeyup = resetIdleTimer;
			document.onscroll = resetIdleTimer;
			startIdleTimer();
		}
	};
})();

function bindEventListeners(game) {


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
	
	var blockchainScore = document.getElementById('js-register-blockchain');
	if (blockchainScore) {
		blockchainScore.addEventListener('click', game.executeBlockchain.bind(game));
	}

	// BETWEEN MATCH

	let exitBtn = document.getElementById('js-exit-btn');
	if (exitBtn) {
		exitBtn.addEventListener('click', game.endGame.bind(game));
	}

	let replayBtn = document.getElementById('js-replay-btn');
	if (replayBtn) {
		replayBtn.addEventListener('click', game.replayGame.bind(game));
	}
}

function bindMenuEventListeners(game){
	// OPTION MENU
	let optionBtn = document.getElementById('js-option-btn');
	if (optionBtn) {
		optionBtn.addEventListener('click', game.viewOptionMenu.bind(game));
	}

	let endGameBtn = document.getElementById('js-end-game-btn');
	if (endGameBtn) {
		endGameBtn.addEventListener('click', game.endGame.bind(game));
	}

	let soundBtn = document.getElementById('js-audio-btn');
	if (soundBtn) {
		soundBtn.addEventListener('click', game.muteAudio.bind(game));
	}

	let settingsBtn = document.getElementById('js-settings-btn');
	if (settingsBtn) {
		settingsBtn.addEventListener('click', game.viewSettingsMenu.bind(game));
	}

	document.getElementById('user-name').addEventListener('click', function() {
		loadPage('dashboard');
	});
	
	document.getElementById('user-avatar').addEventListener('click', function() {
		loadPage('dashboard');
	});


	// Match History

	var matchHistory = document.getElementById('match-history-btn');
	if (matchHistory) {
		matchHistory.addEventListener('click', function() {
			loadPage('match_history').then(() => {
				// Now that the page content has been loaded, call showMatches directly
				showMatches('UvU');
			});
		});
	}

}

function dropDownEventListeners() {
    console.log("LOG: dropDownEventListeners");

    var dropdown1v1 = document.getElementById('dropdown-1v1');
    if (dropdown1v1) {
        dropdown1v1.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default link behavior
            document.getElementById('tournament-history').style.display = 'none';
            document.getElementById('match-history').style.display = 'block';
            showMatches('UvU');
        });
    }

    var dropdownTournament = document.getElementById('dropdown-tournament');
    if (dropdownTournament) {
        dropdownTournament.addEventListener('click', (event) => {
            event.preventDefault();
            document.getElementById('tournament-history').style.display = 'block';
            document.getElementById('match-history').style.display = 'none';
            showTournaments();
        });
    }

    var dropdownVsAI = document.getElementById('dropdown-vs-ai');
    if (dropdownVsAI) {
        dropdownVsAI.addEventListener('click', (event) => {
            event.preventDefault();
            document.getElementById('tournament-history').style.display = 'none';
            document.getElementById('match-history').style.display = 'block';
            showMatches('solo');
        });
    }
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
export { loadPageClosure, updateUI, IdleTimerModule, bindMenuEventListeners };