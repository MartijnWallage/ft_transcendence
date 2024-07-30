
class AI {
	constructor() {
		this.destinationY = 0;
	}

	updateDestination(game) {
	}

	startUpdating() {}
	stopUpdating() {}

	movePaddle(paddle, ball) {
		const bottomPaddle = paddle.position.z + paddle.geometry.parameters.depth / 2;
		const topPaddle = paddle.position.z - paddle.geometry.parameters.depth / 2;
		const bottomBall = ball.position.z + ball.radius / 2;
		const topBall = ball.position.z - ball.radius / 2;
	
		return topBall < topPaddle ? -1 : 
			bottomBall > bottomPaddle ? 1 : 
			0;
	}	
}

export { AI }
