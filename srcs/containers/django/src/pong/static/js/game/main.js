import Stats from './three-lib/stats.module.js'
import { Game } from './classes/Game.js';
import { gameState } from './game-state.js';
import { update } from './update.js'

function main() {
	// FPS stats viewer
	const stats = new Stats();
	stats.showPanel(0);
	document.body.appendChild(stats.dom);

	//key listener
	let keys = {};
	document.addEventListener("keydown", (event) => { 
		keys[event.key] = true; 
	});

	document.addEventListener("keyup", (event) => {
		keys[event.key] = false;
	});

	const container = document.getElementById('threejs-container');
	const game = new Game(container);
	window.addEventListener('resize', () => scene.onWindowResize(gameState));

	requestAnimationFrame(animate.bind(null, stats, game));
}

function animate(timestamp, stats, game) {
	console.log(`Timestamp: ${timestamp}, Arg1: ${stats}, Arg2: ${game}`);
	stats.begin(); // for the FPS stats
	update();
	game.controls.update();
	requestAnimationFrame(animate);
	stats.end(); // for the FPS stats
}

main();
