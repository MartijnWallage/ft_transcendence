import { scoreToWin, getRandomInt, paddleConf, ballConf} from './3d-pong-conf.js';
import { paddle_p2, ball} from './3d-app.js';


// Control paddles
function movePaddlesComputer() {
	if (paddle_p2.position.z - paddle_p2.geometry.parameters.depth / 2 <
		ball.position.z - ballConf.radius / 2) {
		paddle_p2.position.z += paddleConf.speed;
	}
	else if (paddle_p2.position.z + paddle_p2.geometry.parameters.depth / 2 >
		ball.position.z + ballConf.radius / 2) {
		paddle_p2.position.z -= paddleConf.speed;
	} else {
		paddle_p2.position.z = 0;
	}
}

export {movePaddlesComputer};