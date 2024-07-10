import { player2, paddleSpeed, ball } from "./pong-conf.js";

// Control paddles
function movePaddlesComputer() {
	if (player2.y + player2.height / 2 < ball.y) {
		player2.dy = paddleSpeed;
	} 
	else {
		player2.dy = -paddleSpeed;
	}
}

export {movePaddlesComputer};