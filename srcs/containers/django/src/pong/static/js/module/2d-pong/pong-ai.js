import { player2, paddleSpeed, ball } from "./pong-conf.js";

// Control paddles
function movePaddlesComputer() {
	if (player2.y + player2.height / 2 < ball.y - ball.height / 2) {
		player2.dy = paddleSpeed;
	}
	else if (player2.y + player2.height / 2 > ball.y + ball.height / 2) {
		player2.dy = -paddleSpeed;
	} else {
		player2.dy = 0;
	}
}

export {movePaddlesComputer};