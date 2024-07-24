import {ball} from './3d-app.js';

function movePaddlesComputer(paddle_p2) {
	if (paddle_p2.position.z - paddle_p2.geometry.parameters.depth / 2 <
		ball.position.z - ball.radius / 2) {
		paddle_p2.position.z += paddle_p2.speed;
	}
	else if (paddle_p2.position.z + paddle_p2.geometry.parameters.depth / 2 >
		ball.position.z + ball.radius / 2) {
		paddle_p2.position.z -= paddle_p2.speed;
	} else {
		paddle_p2.position.z = 0;
	}
}

export {movePaddlesComputer};