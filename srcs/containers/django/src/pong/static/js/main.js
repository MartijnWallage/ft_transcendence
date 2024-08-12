import Stats from './three-lib/stats.module.js'
import { Game } from './classes/Game.js';
import { loadPageClosure, updateUI } from './loadPage.js';

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
		await window.loadPage(page);
		// await updateUI();
	};
	document.addEventListener('DOMContentLoaded', DOMContentLoadedHandler);

	// prevent to reload #pong page and initiate an empty game, exit to home instead.
	window.addEventListener('load', () => {
		const hash = window.location.hash;
		if (hash) {  // Check if there is any hash in the URL
			if (sessionStorage.getItem('visitedHash')) {
				window.location.href = '/';
			} else {
				sessionStorage.setItem('visitedHash', 'true');
			}
		}
	});
	
	// FPS stats viewer
	// const stats = new Stats();
	// stats.showPanel(0);
	// document.body.appendChild(stats.dom);
	
	window.addEventListener('resize', () => this_game.onWindowResize());

	// main loop
	// requestAnimationFrame(animate.bind(null, stats, this_game));
	requestAnimationFrame(animate.bind(null, this_game));
}

// function animate(stats, game) {
	function animate(game) {
	// begin frame per second state
	// stats.begin();

	// If the game is not running, render the menu view, 
	// Else, update the game
	if (game.running === false) {
		game.cam1.renderMenuView(game);
	} else {
		game.match.update();
	}

	// requestAnimationFrame(animate.bind(null, stats, this_game));
	requestAnimationFrame(animate.bind(null, game));

	// End the frame per second stats
	// stats.end(); 
}

main();
