import Stats from './stats.module.js'
import { initScene } from './3d-scene.js';
import { addGeometry} from './3d-geometry.js';
import {startGameUserVsUser, startGameSolo, startGame, endGame, startTournament} from './3d-game.js';

import { scoreToWin, getRandomInt, ballConf} from './3d-pong-conf.js';
import { gameState } from './3d-game-state.js';

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

function animateBall(){
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

// Serve
function resetBall() {
	ball.position.x = 0;
	ball.position.z = 0;
	ball.serve *= -1;
	ball.dx = ballConf.speed * ball.serve;
	ball.dz = 0;
}

function displayWinMessage(message) {
	// ctx.font = '30px Bitfont';
	// const textMetrics = ctx.measureText(message);
	// const x = (canvas.width - textMetrics.width) / 2;
	// const y = canvas.height / 2;
  
	// ctx.fillText(message, x, y);
	alert('Player 1 wins!');
  }

function updateScore() {
	if (ball.position.x < paddle_p1.position.x) {
		gameState.player2Score += 1;
		console.log("one point for player 2");
		resetBall();
		// resetPaddle() ??
	} else if (ball.position.x > paddle_p2.position.x) {
		gameState.player1Score += 1;
		console.log("one point for player 1");
		resetBall();
		// resetPaddle() ??
	}
	if (gameState.player1Score === scoreToWin) {
		setTimeout(function() {
			displayWinMessage('Player 1 wins!');
		}, 100);
		return false;
	}
	else if (gameState.player2Score === scoreToWin){
		setTimeout(function() {
			displayWinMessage('Player 2 wins!');
		} , 100);
		return false;
	}
	return true;
}

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
