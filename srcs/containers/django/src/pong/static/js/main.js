import Stats from './three-lib/stats.module.js'
import { Game } from './classes/Game.js';
import { loadPageClosure, updateUI, bindMenuEventListeners } from './loadPage.js';

function main() {
	const this_game = new Game();
	// Making game object available for load page
	window.loadPage = loadPageClosure(this_game);

	// Popstate event listener
	window.onpopstate = function (event) {
		const page = event.state ? event.state.page : 'home';
		window.loadPage(page);
	};
	
	// Load homepage when document is ready
	const DOMContentLoadedHandler = async function() {
		const page = location.hash.replace('#', '') || 'home';
		await window.loadPage(page); // await is added to properly handle the updateUI function
	};
	document.addEventListener('DOMContentLoaded', DOMContentLoadedHandler);

	function isMobileDevice() {
		return /Mobi|Android/i.test(navigator.userAgent);
	}
	
	if (isMobileDevice()) {
		document.body.classList.add('mobile-device');
	}

	// prevent to reload #pong page and initiate an empty game, exit to home instead.
	// window.addEventListener('load', () => {
	// 	const hash = window.location.hash;
	// 	if (hash) {  // Check if there is any hash in the URL
	// 		if (sessionStorage.getItem('visitedHash')) {
	// 			window.location.href = '/';
	// 		} else {
	// 			sessionStorage.setItem('visitedHash', 'true');
	// 		}
	// 	}
	// });

	bindMenuEventListeners(this_game);
	window.addEventListener('resize', () => this_game.onWindowResize());
	requestAnimationFrame(animate.bind(null, this_game));
	}

	function animate(game) {
		if (game.running === false) {
			game.cam1.renderMenuView(game);
		} else {
			game.match.update();
		}
		requestAnimationFrame(animate.bind(null, game));
		}

main();
