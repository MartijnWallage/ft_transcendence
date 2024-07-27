import { movePaddleAI } from './ai.js';
import { updateScore } from './score.js';

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

export { update };

