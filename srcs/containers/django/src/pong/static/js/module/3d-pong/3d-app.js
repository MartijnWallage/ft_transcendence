import Stats from './stats.module.js'
import { initScene } from './3d-scene.js';
import { Ball } from './assets/Ball.js';
import { Field } from './assets/Field.js';
import { Paddle } from './assets/Paddle.js';
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

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}
window.addEventListener( 'resize', onWindowResize );

function addGeometry(scene) {
	const paddle_p1 = new Paddle(scene, -7);
	const paddle_p2 = new Paddle(scene, 7);
	const ball = new Ball(scene);
	const field = new Field(scene);
	return ({paddle_p1, paddle_p2, ball, field});
}

const {scene, camera, renderer, hit, controls} = initScene();
const {paddle_p1, paddle_p2, ball, field} = addGeometry(scene);

function update() {
    // move left paddle
    let direction = keys['w'] ? -1 : keys['s'] ? 1 : 0;
    paddle_p1.movePaddle(direction, field);

    // move right paddle
	if (gameState.mode === 'user-vs-computer'){ 
        direction = movePaddleAI(paddle_p2);
	} else {
        direction = keys['ArrowUp'] ? -1 : keys['ArrowDown'] ? 1 : 0;
	}
    paddle_p2.movePaddle(direction, field);

    // move ball
	ball.animateBall();
	ball.checkCollisionPaddle(paddle_p1);
	ball.checkCollisionPaddle(paddle_p2);
	ball.checkCollisionField(field);
	if (gameState.running === false) {
		orbitCamera();
	}
	if (gameState.running === true) {
		camera.position.set(0, 15, 0);
		camera.lookAt(0, 1, 0);
		updateScore();
	}
}

let angle = 0.8;

function orbitCamera(){
	angle += 0.008; // Adjust this value to change the speed of orbit
	const radius = 6;
	//console.log(angle);
	camera.position.x = radius * Math.cos(angle);
	camera.position.z = radius * Math.sin(angle);
	camera.lookAt(0, 1, 0);
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

