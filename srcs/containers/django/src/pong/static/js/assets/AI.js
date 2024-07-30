class AI {
	constructor() {
		this.destination = 0;
		this.intervalId = null;
	}

	updateDestination(paddle, ball, field) {
		this.intervalId = setInterval(() => {
			this.destination = ball.dx < 0 ? ball.y : this.computeDestination(paddle, ball, field);
		}, 1000);
	}

	stopUpdatingDestination() {
		if (this.intervalId) {
			clearInterval(this.intervalId);
			this.intervalId = null;
		}
	}

	computeDestination(paddle, ball, field) {
		let x = ball.x;
		let y = ball.y;
		let dx = ball.dx;
		let dy = ball.dy;
		const height = field.geometry.parameters.depth / 2;
		const paddleX = paddle.position.x - paddle.geometry.parameters.width / 2;

		while (true) {
			x += dx;
			y += dy;

			if (y <= -height) {
				y = -y;
				dy = -dy;
			}

			if (y >= height) {
				y = 2 * height - y;
				dy = -dy;
			}

			if (x >= paddleX) {
				break;
			}
		}

		return y;
	}
	
}

export { AI };