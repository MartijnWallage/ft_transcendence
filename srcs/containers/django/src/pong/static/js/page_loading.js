function loadPage(page) {
	fetch('/api/' + page + '/')
	.then(response => response.json())
	.then(data => {
		  document.getElementById('main-content').innerHTML = data.content;
		  history.pushState({page: page}, "", "#" + page);
	})
	.catch(error => {
		  console.error('Error loading page:', error);
	});
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