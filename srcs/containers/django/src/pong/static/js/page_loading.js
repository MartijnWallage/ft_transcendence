
function loadPage(page) {
	fetch('/api/' + page + '/')
	.then(response => response.json())
	.then(data => {
		  document.getElementById('main-content').innerHTML = data.content;
		  history.pushState({page: page}, "", "#" + page);
		  bindEventListeners();
	})
	.catch(error => {
		  console.error('Error loading page:', error);
	});
}

function bindEventListeners() {
	var leaderBoardButton = document.getElementById('leaderboardButton');
	if (leaderBoardButton) {
		leaderBoardButton.addEventListener('click', showLeaderBoard);
	}
	var leaderBoardClose = document.getElementById('leaderboardClose');
	if (leaderBoardClose) {
		leaderBoardClose.addEventListener('click', hideLeaderBoard);
	}
}

function showLeaderBoard() {
	var leaderBoardDiv = document.getElementById('leaderboardDiv');
	if (leaderBoardDiv) {
		leaderBoardDiv.style.display = 'block';
	}
	var leaderBoardButton = document.getElementById('leaderboardButton');
	if (leaderBoardButton) {
		leaderBoardButton.style.display = 'none';
	}
}
function hideLeaderBoard() {
	var leaderBoardDiv = document.getElementById('leaderboardDiv');
	if (leaderBoardDiv) {
		leaderBoardDiv.style.display = 'none';
	}
	var leaderBoardButton = document.getElementById('leaderboardButton');
	if (leaderBoardButton) {
		leaderBoardButton.style.display = 'block';
	}
}

  window.onpopstate = function(event) {
	if (event.state) {
		loadPage(event.state.page);
	} else {
		loadPage('home'); // Default page
	}
  };

	// Example of loading the home page on document ready
  document.addEventListener('DOMContentLoaded', function() {
	  const page = location.hash.replace('#', '') || 'home';
	  loadPage(page);
	});