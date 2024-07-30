import { movePaddleAI } from './ai.js';
import { updateScore } from './score.js';

function update(keys, game) {
	const field = game.field;
	const paddle1 = game.paddle1;
	const paddle2 = game.paddle2;
	const ball = game.ball;
	const cam1 = game.cam1;
	const cam2 = game.cam2;

	// move left paddle
	let direction = keys['a'] ? -1 : keys['d'] ? 1 : 0;
	paddle1.movePaddle(direction, field);

	// move right paddle
	direction = game.mode === 'user-vs-computer' ? movePaddleAI(paddle2, ball) :
		keys['ArrowRight'] ? -1 :
		keys['ArrowLeft'] ? 1 :
		0;
	paddle2.movePaddle(direction, field);

    // move and bounce ball
	ball.animateBall();
    ball.tryPaddleCollision(paddle1, paddle2, game.audio);
	ball.tryCourtCollision(field);

	var split = document.getElementById('vertical-line');
	if (game.running === false) {
		cam1.renderMenuView(game);
		split.style.display = 'none';
	} else {
		updateScore(game);
		if (game.mode === 'user-vs-computer') {
			cam1.renderSingleView(game);
		}
		if (game.mode === 'user-vs-user' || game.mode === 'tournament') {
			cam1.renderSplitView(game, 0);
			cam2.renderSplitView(game, 1);
			split.style.display = 'block';
		}
	}
}

export { update };

