import Stats from './stats.module.js'
import { initScene } from './3d-scene.js';
import { addGeometry} from './3d-geometry.js';
import { movePaddles, checkCollisionPaddle, checkCollisionField, animateBall, updateScore } from './3d-pong-core.js';
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

const {scene, camera, renderer, hit, controls} = initScene();
const {paddle_p1, paddle_p2, ball, field} = addGeometry(scene);
window.addEventListener( 'resize', onWindowResize );

function update(){
	movePaddles();
	checkCollisionPaddle(paddle_p1);
	checkCollisionPaddle(paddle_p2);
	checkCollisionField()
	animateBall();
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
	console.log(angle);
	camera.position.x = radius * Math.cos(angle);
	camera.position.z = radius * Math.sin(angle);
	camera.lookAt(0, 1, 0);
}

function animate() {
	stats.begin(); // for the FPS stats
	update();
	controls.update();
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
	stats.end(); // for the FPS stats
} animate();

export { paddle_p2, paddle_p1, ball, field, keys };

