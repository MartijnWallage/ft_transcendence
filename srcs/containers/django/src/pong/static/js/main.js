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
		const page = event.state ? event.state.page : 'game_mode';
		window.loadPage(page);
	};
	
	// Load homepage when document is ready
	const DOMContentLoadedHandler = async function() {
		console.log('DOMContentLoaded event');
		let page = location.hash.replace('#', '') || 'home';
		await window.loadPage(page); // await is added to properly handle the updateUI function
		this_game.userProfile.IdleTimerModule.init();
	};

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
		if (hash) {  // Check if there is any hash in the URL
			if (sessionStorage.getItem('visitedHash')) {
				window.location.href = '/';
			} 
			else {
				sessionStorage.setItem('visitedHash', 'true');
			}
		}

	});
	


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
