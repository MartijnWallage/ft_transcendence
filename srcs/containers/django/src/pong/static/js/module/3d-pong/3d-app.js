import Stats from './stats.module.js'
import { initScene } from './3d-scene.js';
import { addGeometry} from './3d-geometry.js';

import { scoreToWin, getRandomInt, ballConf} from './3d-pong-conf.js';

// FPS stats viewer
const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

let keys = {};
document.addEventListener("keydown", (event) => { 
	keys[event.key] = true; 
});

document.addEventListener("keyup", (event) => {
	keys[event.key] = false;
});

const {scene, camera, renderer, hit} = initScene();
const {paddle_p1, paddle_p2, ball, field} = addGeometry(scene);

function animate_ball(){
	ball.position.x += ball.dx;
	ball.position.z += ball.dz;
}

function movePaddles(){
	if (paddle_p1.position.z - paddle_p1.geometry.parameters.depth / 2 >
			field.position.z - field.geometry.parameters.depth / 2 
			&& keys["w"]) {
				paddle_p1.position.z -= 0.2;
	}
	else if (paddle_p1.position.z + paddle_p1.geometry.parameters.depth / 2 <
			field.position.z + field.geometry.parameters.depth / 2 
			&& keys["s"]) {
				paddle_p1.position.z += 0.2;
	}
	// if (online || ai)
	// {
	// 	// insert ai code or online function for the paddle movement
	// }
	else
	{
		if (paddle_p2.position.z - paddle_p2.geometry.parameters.depth / 2 >
				field.position.z - field.geometry.parameters.depth / 2 
				&& keys["ArrowUp"]) {
					paddle_p2.position.z -= 0.2;
		}
		else if (paddle_p2.position.z + paddle_p2.geometry.parameters.depth / 2 <
				field.position.z + field.geometry.parameters.depth / 2 
				&& keys["ArrowDown"]) {
					paddle_p2.position.z += 0.2;
		}
	}
}

function checkCollisionPaddle(paddle){
	if (ball.position.x - ballConf.radius < paddle.position.x + paddle.geometry.parameters.width / 2 &&
			ball.position.x + ballConf.radius > paddle.position.x - paddle.geometry.parameters.width / 2 &&
			ball.position.z - ballConf.radius < paddle.position.z + paddle.geometry.parameters.depth / 2 &&
			ball.position.z + ballConf.radius > paddle.position.z - paddle.geometry.parameters.depth / 2) {
			ball.dz = (ball.position.z - (paddle.position.z)) * 0.15;
			ball.dx *= -1.03;
			// hit.play(); // uncomment to play sound on hit
		}
}

function checkCollisionField(){
	if (ball.position.x - ballConf.radius < field.position.x - field.geometry.parameters.width / 2 ||
			ball.position.x + ballConf.radius > field.position.x + field.geometry.parameters.width / 2) {
			ball.dx *= -1.03;
		}
	if (ball.position.z - ballConf.radius < field.position.z - field.geometry.parameters.depth / 2 ||
			ball.position.z + ballConf.radius > field.position.z + field.geometry.parameters.depth / 2) {
			ball.dz *= -1;
		}
}

function update(){
	checkCollisionPaddle(paddle_p1);
	checkCollisionPaddle(paddle_p2);
	checkCollisionField()
	animate_ball();
	movePaddles();
}

function animate() {
	stats.begin(); // for the FPS stats
	update();
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
	stats.end(); // for the FPS stats
} animate();
