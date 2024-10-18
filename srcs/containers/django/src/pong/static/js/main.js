import Stats from './three-lib/stats.module.js'
import { Game } from './classes/Game.js';
import { loadPageClosure, bindMenuEventListeners } from './loadPage.js';

function main() {
	const this_game = new Game();


    // Making game object available for load page
    window.loadPage = loadPageClosure(this_game);

    // Popstate event listener
    window.onpopstate = function (event) {
        console.log('popstate event');
        const page = event.state ? event.state.page : 'home';
        window.loadPage(page);
    };

		// Load homepage when document is ready
		const DOMContentLoadedHandler = async function() {
			
			const page = location.hash.replace('#', '') || 'home';
			if (page.includes('oauth_success?username')) {
				console.log('DOMContentLoaded event and loading page for oauth', page);
				// await window.loadPage('game_mode');
				history.pushState(null, '', '');
				this_game.userProfile.handleOAuthSuccess(page);

			} else {
				console.log('DOMContentLoaded event and loading page', page);
				await window.loadPage(page); // await is added to properly handle the updateUI function
				this_game.userProfile.IdleTimerModule.init();
			}
		};
	// }


	document.addEventListener('DOMContentLoaded', DOMContentLoadedHandler);

	function isMobileDevice() {
		return /Mobi|Android/i.test(navigator.userAgent);
	}
	
	if (isMobileDevice()) {
		document.body.classList.add('mobile-device');
	}

	// prevent to reload #pong page and initiate an empty game, exit to home instead.
	window.addEventListener('load', () => {
		console.log('load event');
		const hash = window.location.hash;
		// if (hash && !hash.includes('oauth_success')) {  // Check if there is any hash in the URL
		if (hash) {  // Check if there is any hash in the URL
			if (sessionStorage.getItem('visitedHash')) {
				window.location.href = '/';
			} else {
				sessionStorage.setItem('visitedHash', 'true');
			}
		}
		// const savedState = JSON.parse(localStorage.getItem("currentPageState"));
		// if (savedState) {
		// 	// Restore the application state here based on savedState.page
		// 	navigateToPage(savedState.page);
		// }
	});

	// function navigateToPage(page) {
	// 	window.loadPage(page);
	// }

	bindMenuEventListeners(this_game);
	window.addEventListener('resize', () => this_game.onWindowResize());
	requestAnimationFrame(animate.bind(null, this_game));
}

	function animate(game) {
		if (game.running === false) {
			game.cam1.renderMenuView();
		} else {
			game.match.update(game);
		}
		requestAnimationFrame(animate.bind(null, game));
    }

main();
