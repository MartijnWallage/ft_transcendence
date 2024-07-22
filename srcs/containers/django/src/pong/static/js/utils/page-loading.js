// import { addPlayer, startGameUserVsUser, startGameSolo, startTournament } from "../module/2d-pong/entrypoint.js";
import { endGame, startGameUserVsUser, startGameSolo, startTournament } from "../module/3d-pong/3d-game.js";
import { addPlayer } from '../module/3d-pong/3d-tournament.js';

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
	return new Promise((resolve, reject) => {
		const mainContent = document.getElementById('main-content');
		const underTitle = document.getElementById('under-title');
		const userContent = document.getElementById('user');
  
		const updateContent = () => {
		fetch('/api/' + page + '/')
			// .then(response => response.json())
			.then(response => {
				console.log('Response received:', response);
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				return response.json();
			})
			.then(data => {
				console.log('Data received:', data);
				if (data.content) {
					console.log('Content found in data:', data.content);
				} else {
					console.error('No content found in data');
				}
				// mainContent.innerHTML = data.content;
				// also adding user management to load page
				if (page === 'login' || page === 'register') {
					console.log('login called', page);
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
			fadeOut(underTitle).then(updateContent);
		} else {
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


// Example of loading the home page on document ready
document.addEventListener('DOMContentLoaded', () => {
	const page = location.hash.replace('#', '') || 'home';
	loadPage(page);
});


function bindEventListeners() {
// trying to handle user event
    const mainContent = document.getElementById('main-content');
    const userContent = document.getElementById('user');

    mainContent.addEventListener('submit', function(event) {
        event.preventDefault();
        const form = event.target;
        if (form.id === 'login-form') {
            handleFormSubmit(form, '/api/login/');
        } else if (form.id === 'register-form') {
            handleFormSubmit(form, '/api/register/');
        }
    });

    userContent.addEventListener('submit', function(event) {
        event.preventDefault();
        const form = event.target;
        if (form.id === 'login-form') {
            handleFormSubmit(form, '/api/login/');
        } else if (form.id === 'register-form') {
            handleFormSubmit(form, '/api/register/');
        }
    });
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

    fetch(url, {
        method: 'POST',
        body: JSON.stringify(Object.fromEntries(formData)),
        headers: {
            'Content-Type': 'application/json',// CSRF token handling
        }
        // headers: {
        //     'Content-Type': 'application/json',
        //     'X-CSRFToken': getCookie('csrftoken'),  // CSRF token handling
        // }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            loadPage('home');  // Redirect to home or another page
        } else {
            const errorContainer = document.getElementById('error-container');
            if (errorContainer) {
                errorContainer.innerHTML = JSON.stringify(data);
            }
        }
    })
    .catch(error => {
        console.error('Error submitting form:', error);
    });
}


//Cookies to check login

// function getCookie(name) {
//     let cookieValue = null;
//     if (document.cookie && document.cookie !== '') {
//         const cookies = document.cookie.split(';');
//         for (let i = 0; i < cookies.length; i++) {
//             const cookie = cookies[i].trim();
//             if (cookie.substring(0, name.length + 1) === (name + '=')) {
//                 cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
//                 break;
//             }
//         }
//     }
//     return cookieValue;
// }