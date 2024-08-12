import { handleFormSubmitWrapper, handleLogout } from './userMgmt.js';

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
			history.pushState({ page: page }, "", "#" + page);
			
			const updatedUnderTitle = document.getElementById('under-title');
			if (updatedUnderTitle) {
				await fadeIn(updatedUnderTitle);
			}
			await updateUI();
			console.log('Page UI updated:', page);
			bindUserEventListeners(mainContent);
			bindEventListeners(game);
			
		} catch (error) {
			console.error('Error loading page:', error);
			throw error;
		}
	};
}

async function fetchUserInfo() {
	try {
	  const response = await fetch('/api/home/');
	  const data = await response.json();
	  if (data.user_info.is_logged_in) {
		window.userInfo = data; // Store userInfo in a global variable
		console.log('User info fetched:', window.userInfo);
	  } else {
		window.userInfo = null; // Clear userInfo if not logged in
	  }
	} catch (error) {
	  console.error('Failed to fetch user info', error);
	  window.userInfo = null; // Ensure userInfo is null on failure
	}
  }

async function updateUI() {
	await fetchUserInfo();
	// console.log('User info:', window.userInfo.user_info.username);
	const userStatus = window.userInfo;
    if (userStatus && userStatus.is_logged_in) {
		console.log('User info:', userStatus.user_info.username);
        document.getElementById('login-link').style.display = 'none';
        document.getElementById('register-link').style.display = 'none';
        document.getElementById('logout-link').style.display = 'block';
        document.getElementById('user-info').style.display = 'block';
        document.getElementById('user-info').innerText = `Welcome, ${userStatus.user_info.username}`;
    } else {
		document.getElementById('login-link').style.display = 'block';
        document.getElementById('register-link').style.display = 'block';
        document.getElementById('logout-link').style.display = 'none';
        document.getElementById('user-info').style.display = 'none';
    }
}

function bindUserEventListeners(userContent) {
		
	if (userContent) {
        // userContent.removeEventListener('submit', handleFormSubmitWrapper);
        userContent.addEventListener('submit', handleFormSubmitWrapper);
    }

}
function bindEventListeners(game) {

	document.getElementById('logout-link').addEventListener('click', handleLogout);

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

	// OPTION MENU
	let optionBtn = document.getElementById('js-option-btn');
	if (optionBtn) {
		optionBtn.addEventListener('click', game.showOptionMenu.bind(game));
	}

	let endGameBtn = document.getElementById('js-end-game-btn');
	if (endGameBtn) {
		endGameBtn.addEventListener('click', game.endGame.bind(game));
	}

	let soundBtn = document.getElementById('js-audio-btn');
	if (soundBtn) {
		soundBtn.addEventListener('click', game.muteAudio.bind(game));
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