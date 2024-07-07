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
	var scoreBoardButton = document.getElementById('scoreBoardButton');
	if (scoreBoardButton) {
		scoreBoardButton.addEventListener('click', showscoreBoard);
	}
	var scoreBoardClose = document.getElementById('scoreBoardClose');
	if (scoreBoardClose) {
		scoreBoardClose.addEventListener('click', hidescoreBoard);
	}
}

function showscoreBoard() {
	var scoreBoardDiv = document.getElementById('scoreBoardDiv');
	if (scoreBoardDiv) {
		scoreBoardDiv.style.display = 'block';
	}
	var scoreBoardButton = document.getElementById('scoreBoardButton');
	if (scoreBoardButton) {
		scoreBoardButton.style.display = 'none';
	}
}
function hidescoreBoard() {
	var scoreBoardDiv = document.getElementById('scoreBoardDiv');
	if (scoreBoardDiv) {
		scoreBoardDiv.style.display = 'none';
	}
	var scoreBoardButton = document.getElementById('scoreBoardButton');
	if (scoreBoardButton) {
		scoreBoardButton.style.display = 'block';
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