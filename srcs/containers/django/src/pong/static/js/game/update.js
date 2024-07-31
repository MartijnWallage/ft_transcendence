import Stats from './three-lib/stats.module.js'
import { Scene } from './assets/Scene.js';
import { movePaddleAI } from './ai.js';
import { updateScore } from './score.js';
import { gameState } from './game-state.js';

// FPS stats viewer
// const stats = new Stats();
// stats.showPanel(0);
// document.body.appendChild(stats.dom);

//key listener
let keys = {};
document.addEventListener("keydown", (event) => { 
	keys[event.key] = true; 
});

document.addEventListener("keyup", (event) => {
	keys[event.key] = false;
});

document.addEventListener("touchstart", (event) => {
	let touchX = event.touches[0].clientX;
	let containerWidth = window.innerWidth;
	let middle = containerWidth / 2;

	if (touchX < middle) {
		keys['a'] = true;
		keys['d'] = false;
	} else {
		keys['a'] = false;
		keys['d'] = true;
	}
});

document.addEventListener("touchend", (event) => {
	// Reset the direction when touch ends
	keys['a'] = false;
	keys['d'] = false;
});

const container = document.getElementById('threejs-container');
const scene = new Scene(container);
window.addEventListener('resize', () => scene.onWindowResize(gameState));
const { ball, field, paddle_p1, paddle_p2, cam1, cam2 } = scene;

function update() {
	// move left paddle
	let direction = keys['a'] ? -1 : keys['d'] ? 1 : 0;
	paddle_p1.movePaddle(direction, field);

	// move right paddle
	if (gameState.mode === 'user-vs-computer'){ 
		direction = movePaddleAI(paddle_p2, ball);
	} else {
		direction = keys['ArrowRight'] ? -1 : keys['ArrowLeft'] ? 1 : 0;
	}
	paddle_p2.movePaddle(direction, field);

    // move and bounce ball
	ball.animateBall();
    ball.tryPaddleCollision(paddle_p1, paddle_p2, scene.audio);
	ball.tryCourtCollision(field);

	var split = document.getElementById('vertical-line');
	if (gameState.running === false) {
		cam1.renderMenuView(scene);
		split.style.display = 'none';
	}
	if (gameState.running === true) {
		updateScore(field);
		if (gameState.mode === 'user-vs-computer') {
			cam1.renderSingleView(scene);
		}
		if (gameState.mode === 'user-vs-user' || gameState.mode === 'tournament') {
			cam1.renderSplitView(scene, 0);
			cam2.renderSplitView(scene, 1);
			split.style.display = 'block';
		}
	}
}

function animate() {
	// stats.begin(); // for the FPS stats
	update();
	// scene.controls.update();
	requestAnimationFrame(animate);
	// stats.end(); // for the FPS stats
}

requestAnimationFrame(animate);

export { paddle_p2, paddle_p1, ball, field, keys };

