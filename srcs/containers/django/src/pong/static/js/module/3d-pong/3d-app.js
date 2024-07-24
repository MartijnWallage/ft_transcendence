import Stats from './stats.module.js'
import { Scene } from './assets/Scene.js';
import { movePaddlesComputer } from './3d-pong-ai.js';
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
const ball = scene.ball;
const field = scene.field;
const paddle_p1 = scene.paddle_p1;
const paddle_p2 = scene.paddle_p2;
const camera = scene.camera;

window.addEventListener( 'resize', scene.onWindowResize());

function update(){
	paddle_p1.movePaddles(keys["w"], keys["s"], field);
	if (gameState.mode === 'user-vs-computer'){ 
		movePaddlesComputer(paddle_p2);
	}
	else {
		paddle_p2.movePaddles(keys["ArrowUp"], keys["ArrowDown"], field);
	}
	ball.animateBall();
	ball.checkCollisionPaddle(paddle_p1);
	ball.checkCollisionPaddle(paddle_p2);
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
	controls.update();
	renderer.render(scene, camera);
	requestAnimationFrame(animate);
	stats.end(); // for the FPS stats
} animate();

export { paddle_p2, paddle_p1, ball, field, keys };

