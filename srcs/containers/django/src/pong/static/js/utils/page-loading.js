// import { addPlayer, startGameUserVsUser, startGameSolo, startTournament } from "../module/2d-pong/entrypoint.js";
import { endGame, startGameUserVsUser, startGameSolo, startTournament } from "../module/3d-pong/3d-game.js";
import { addPlayer } from '../module/3d-pong/3d-tournament.js';


document.addEventListener('DOMContentLoaded', function() {
	fetch('/api/home/')
		.then(response => response.json())
		.then(data => {
			updateUI(data);
			bindEventListeners();
		});

	// window.onpopstate = (event)
});


function updateUI(data) {
    if (data.is_logged_in) {
        document.getElementById('login-link').style.display = 'none';
        document.getElementById('register-link').style.display = 'none';
        document.getElementById('logout-link').style.display = 'block';
        document.getElementById('user-info').style.display = 'block';
        document.getElementById('user-info').innerText = `Welcome, ${data.user_info.username}`;
		// loadPage('home')
    } else {
		document.getElementById('login-link').style.display = 'block';
        document.getElementById('register-link').style.display = 'block';
        document.getElementById('logout-link').style.display = 'none';
        document.getElementById('user-info').style.display = 'none';
		// loadPage('home')
    }

    document.getElementById('main-content').innerHTML = data.content;
	// loadPage('home');
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

window.loadPage = (page) => {
	console.log('Loading page:', page);
	return new Promise((resolve, reject) => {
		const mainContent = document.getElementById('main-content');
		const underTitle = document.getElementById('under-title');
		const userContent = document.getElementById('user');
  
		const updateContent = () => {
		fetch('/api/' + page + '/')
			// .then(response => response.json())
			.then(response => {
				console.log('Response received:');
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				return response.json();
			})
			.then(data => {
				if (page === 'login_user') {
					console.log('login called', page);
					mainContent.style.display = 'none';
					userContent.style.display = 'block';
					userContent.innerHTML = data.content;
				} else if (page === 'register_user'){
					console.log('Register called', page);
					mainContent.style.display = 'none';
					userContent.style.display = 'block';
					userContent.innerHTML = data.content;
				} else {
					console.log('login is not ********* called', page);
					mainContent.style.display = 'block';
					userContent.style.display = 'none';
					mainContent.innerHTML = data.content;
				}
				//when showing users signup or login other contain will be invisible
				history.pushState({ page: page }, "", "#" + page);
				updateUI(data);
				bindEventListeners();
	
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
			console.log('Under title element found:', underTitle);
			fadeOut(underTitle).then(updateContent);
		} else {
			console.log('Under title element not found');
			updateContent();
		}
	});
};

window.loadPage = loadPage;

window.onpopstate = (event) => {
if (event.state)
	loadPage(event.state.page);
else
	loadPage('home'); // Default page
};

function handleFormSubmitWrapper(event) {
    event.preventDefault();
    const form = event.target;

    let url;
    if (form.id === 'login-form') {
        console.log("User content login-form handling");
        url = '/api/login/';
    } else if (form.id === 'register-form') {
        console.log("User content register-form handling");
        url = '/api/register/';
    } else if (form.id === 'logout-form') {
        console.log("User content logout-form handling");
        url = '/api/logout/';
    } else {
        console.error('Form ID not recognized');
        return;
    }

    handleFormSubmit(form, url);
}

function bindEventListeners() {
// trying to handle user event
    const userContent = document.getElementById('user');

	if (userContent) {
        // Remove existing event listeners to prevent multiple bindings
        userContent.removeEventListener('submit', handleFormSubmitWrapper);

        // Add new event listener for form submissions
        userContent.addEventListener('submit', handleFormSubmitWrapper);
    } else {
        console.warn('Element with ID "user" not found');
    }

	// user event listerner
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

// functions to handle form submits
function handleFormSubmit(form, url) {
    const formData = new FormData(form);

	console.log("handleformsubmit called")
    fetch(url, {
        method: 'POST',
        body: JSON.stringify(Object.fromEntries(formData)),
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),  // CSRF token handling
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success' || response.ok) {
			if (url.includes('login') || url.includes('register')) {
				console.log("logging in updating")
				history.pushState(null, '', '');
				loadPage('home');

			} else if (url.includes('logout')) {
				history.pushState(null, '', '');
				loadPage('home');
			}
        } else {
            const errorContainer = document.getElementById('error-container');
            if (errorContainer) {
                errorContainer.innerHTML = JSON.stringify(data);
            }
        }
    })
    .catch(error => {
		console.error("Fetch error:", error);
	 });
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}