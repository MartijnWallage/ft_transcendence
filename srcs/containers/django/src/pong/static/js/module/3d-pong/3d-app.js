import Stats from './utils/stats.module.js'
import { Scene } from './assets/Scene.js';
import { movePaddleAI } from './3d-pong-ai.js';
import { updateScore } from './3d-pong-core.js';
import { gameState } from './3d-game-state.js';

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
const scene = new Scene(container);
window.addEventListener( 'resize', scene.onWindowResize());
const ball = scene.ball;
const field = scene.field;
const paddle_p1 = scene.paddle_p1;
const paddle_p2 = scene.paddle_p2;
const camera = scene.camera;

function update() {
	// move left paddle
	let direction = keys['w'] ? -1 : keys['s'] ? 1 : 0;
	paddle_p1.movePaddle(direction, field);

	// move right paddle
	if (gameState.mode === 'user-vs-computer'){ 
		direction = movePaddleAI(paddle_p2, ball);
	} else {
		direction = keys['ArrowUp'] ? -1 : keys['ArrowDown'] ? 1 : 0;
	}
	paddle_p2.movePaddle(direction, field);

    // move and bounce ball
	ball.animateBall();
	ball.checkCollisionPaddle(paddle_p1, scene.audio);
	ball.checkCollisionPaddle(paddle_p2, scene.audio);
	ball.checkCollisionField(field);

	if (gameState.running === false) {
		camera.orbitCamera();
	}
	if (gameState.running === true) {
		camera.cam.position.set(0, 15, 0);
		camera.cam.lookAt(0, 1, 0);
		updateScore();
	}
}

function animate() {
	stats.begin(); // for the FPS stats
	update();
	scene.controls.update();
	scene.renderer.render(scene.scene, scene.camera.cam);
	requestAnimationFrame(animate);
	stats.end(); // for the FPS stats
} animate();

export { paddle_p2, paddle_p1, ball, field, keys };

