// import { updateUI, bindUserEventListeners, handleLogout} from './userMgmt.js';

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
			// localStorage.setItem("currentPageState", JSON.stringify({ page: page }));

			
			const updatedUnderTitle = document.getElementById('under-title');
			if (updatedUnderTitle) {
				await fadeIn(updatedUnderTitle);
			}
			await game.userProfile.updateUI(game);
			console.log('Page UI updated:', page);
			game.userProfile.bindUserEventListeners(mainContent, page);
			bindEventListeners(game);
			if (page === 'match_history') {
				// document.getElementById('lastModified').textContent = new Date(document.lastModified).toLocaleString();
				dropDownEventListeners(game);
			}
			
		} catch (error) {
			console.error('Error loading page:', error);
			throw error;
		}
	};
}

function bindEventListeners(game) {

	const startVsOnline = document.getElementById('js-start-vs-online-btn');
	if (startVsOnline) {
		startVsOnline.addEventListener('click', game.startVsOnline.bind(game));
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
	
	var blockchainScore = document.getElementById('js-register-blockchain');
	if (blockchainScore) {
		blockchainScore.addEventListener('click', game.executeBlockchain.bind(game));
	}

	const saveSettings = document.getElementById('saveSettings');
	if (saveSettings) {
		saveSettings.addEventListener('click', game.saveSettings.bind(game));
	}

	const resetDefaults = document.getElementById('resetDefaults');
	if (resetDefaults) {
		resetDefaults.addEventListener('click', game.resetToDefaults.bind(game));
	}
	
/* 	const closeSettings = document.getElementById('closeSettingsMenu');
	if (closeSettings) {
		closeSettings.addEventListener('click', loadPage('game_mode'));
	} */

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

	document.getElementById('js-settings-btn').addEventListener('click', function() {
		loadPage('settings');
	});
	document.getElementById('user-name').addEventListener('click', function() {
		if (game.userProfile.isUserLoggedIn){
			loadPage('dashboard');
		}
	});

	document.getElementById('user-avatar').addEventListener('click', function() {
		if (game.userProfile.isUserLoggedIn){
			loadPage('dashboard');
		}
	});


	var matchHistory = document.getElementById('match-history-btn');
	if (matchHistory) {
		matchHistory.addEventListener('click', function() {
			loadPage('match_history').then(() => {
				// Now that the page content has been loaded, call showMatches directly
				this.game.stats.statForUser = this.game.loggedUser;
				game.stats.showMatches('UvU');
			});
		});
	}

	let logout_btn = document.getElementById('js-logout-btn');
	if (logout_btn) {
		logout_btn.addEventListener('click', game.userProfile.handleLogout.bind(game.userProfile));
	} 


}

function dropDownEventListeners(game) {
    console.log("LOG: dropDownEventListeners");

    var dropdown1v1 = document.getElementById('dropdown-1v1');
    if (dropdown1v1) {
        dropdown1v1.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default link behavior
            document.getElementById('tournament-history').style.display = 'none';
            document.getElementById('match-history').style.display = 'block';
            game.stats.showMatches('UvU');
        });
    }

    var dropdownTournament = document.getElementById('dropdown-tournament');
    if (dropdownTournament) {
        dropdownTournament.addEventListener('click', (event) => {
            event.preventDefault();
            document.getElementById('tournament-history').style.display = 'block';
            document.getElementById('match-history').style.display = 'none';
            game.stats.showTournaments();
        });
    }

    var dropdownVsAI = document.getElementById('dropdown-vs-ai');
    if (dropdownVsAI) {
        dropdownVsAI.addEventListener('click', (event) => {
            event.preventDefault();
            document.getElementById('tournament-history').style.display = 'none';
            document.getElementById('match-history').style.display = 'block';
            game.stats.showMatches('solo');
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
export { loadPageClosure, bindMenuEventListeners };