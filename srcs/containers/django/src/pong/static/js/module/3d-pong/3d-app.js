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

const {scene, camera, renderer, hit} = initScene();
const {paddle_p1, paddle_p2, ball, field} = addGeometry(scene);

function update(){
	movePaddles();
	checkCollisionPaddle(paddle_p1);
	checkCollisionPaddle(paddle_p2);
	checkCollisionField()
	animateBall();
	if (gameState.running === true) {
		updateScore();
	} 
}

function animate() {
	stats.begin(); // for the FPS stats
	update();
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
	stats.end(); // for the FPS stats
} animate();

export { paddle_p2, paddle_p1, ball, field, keys };