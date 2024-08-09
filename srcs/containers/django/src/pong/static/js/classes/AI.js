/* Some possible improvements
 * Write a function that will predict the ball's z position on the other side, given the current ball and paddle position
 * Use this function to make decisions about where to move the paddle. Try to hit away from the human paddle
 * Incorporate PID control to deal with errors in the prediction
 */


class AI {
	constructor(game) {
		this.game = game;
		this.destination = 0;
		this.side = 1;
        this.lastUpdateTime = 0;
        this.updateInterval = 1000; // 1000 milliseconds = 1 second
        this.init();
		this.humanPaddle = this.game.paddle1;
		this.ball = this.game.ball;
		this.AIPaddle = this.game.paddle2;
		this.AIPaddle.dz = 1;
    }

	
    // Method to initialize the interval
    init() {
        setInterval(() => this.refreshView(), this.updateInterval);
    }

    // Method to refresh the AI's view of the game
    refreshView() {
		if (!this.game.running) {
			return;
		}
        const currentTime = Date.now();
        if (currentTime - this.lastUpdateTime >= this.updateInterval) {
            this.lastUpdateTime = currentTime;
            this.updateDestination();
        }
    }

	max(a, b, c) {
		return a > b && a > c ? a : b > c ? b: c;
	}

    // Actual method to update the game view
    updateDestination() {
		const ball = this.copyBall(this.ball);
		const humanPaddle = this.copyPaddle(this.humanPaddle);
		this.destination = this.recursiveUpdateDestination(ball, humanPaddle);
    }
	
	recursiveUpdateDestination(ball, humanPaddle) {
		// to avoid infinite loops, ball.dz is not allowed to be 1
		if (Math.abs(ball.dz) >= 1) {
			ball.dz = 0.9;
		}
		const halfCourt = this.game.field.geometry.parameters.depth / 2;
		const paddleHalfDepth = humanPaddle.depth / 2;
		const paddleHalfWidth = humanPaddle.width / 2;
		const ballRadius = ball.radius;
		
		const paddle = ball.dx < 0 ? humanPaddle : this.game.paddle2;
		const paddleTop = paddle.z - paddleHalfDepth;
		const paddleBottom = paddle.z + paddleHalfDepth;
		const paddleSide = ball.dx < 0 ? paddle.x + paddleHalfWidth : paddle.x - paddleHalfWidth;
		const ballSide = ball.dx < 0 ? ball.x - ballRadius : ball.x + ballRadius;

		const distanceToPaddle = Math.abs(ballSide - paddleSide) + Math.abs(ball.dx);
		const ballDestination = ball.z + ball.dz / Math.abs(ball.dx) * distanceToPaddle;
		
		// if ball is moving towards the AI paddle, return the destination
		if (ball.dx > 0 && Math.abs(ballDestination) + ballRadius < halfCourt) {
			return ballDestination;
		}

		// if the ball is moving towards one of the walls, recurse
		if (Math.abs(ballDestination) + ballRadius > halfCourt) {
			const wall = ball.dz > 0 ? halfCourt : -halfCourt;
			const distanceToWall = Math.abs(wall - ball.z) - ballRadius + Math.abs(ball.dx);
			const timeToWall = distanceToWall / Math.abs(ball.dz);
			ball.x = ball.x + timeToWall * ball.dx;
			ball.z = wall < 0 ?
			wall + ballRadius :
			wall - ballRadius;
			ball.dz = -ball.dz;
			return this.recursiveUpdateDestination(ball, humanPaddle);
		}
		
		// if the ball is moving towards the human paddle, recurse
		if (ball.dx < 0) {
			ball.z = ballDestination;
			ball.dx = -ball.dx;
			ball.x = paddleSide + ballRadius;
			
			// Assume the human paddle will reach the ball
			if (paddleTop > ballDestination) {
				humanPaddle.z = ballDestination + paddleHalfDepth;
			} else if (paddleBottom < ballDestination) {
				humanPaddle.z = ballDestination - paddleHalfDepth;
			}
			ball.dz = (ballDestination - humanPaddle.z) * ball.angleMultiplier;
			return this.recursiveUpdateDestination(ball, humanPaddle);
		}
	}
	
	movePaddle(paddle) {
		// Predict where the ball will end up when we move the paddle up, down, or stay still
		// Choose the option that will result in the ball being farther from the human paddle
		const halfCourt = this.game.field.geometry.parameters.depth / 2;
		const halfPaddle = paddle.geometry.parameters.depth / 2;
		const bottomPaddle = paddle.z + halfPaddle;
		const topPaddle = paddle.z - halfPaddle;

		if (this.destination < topPaddle)
			return -1;
		if (this.destination > bottomPaddle)
			return 1;

//		const upMuch = topPaddle - halfPaddle < -halfCourt ? 0 : this.evaluateMove(-halfPaddle);
		const still = this.evaluateMove(paddle.z);
		let up = this.evaluateMove(paddle.z - halfPaddle); 
		let down = this.evaluateMove(paddle.z + halfPaddle);

		if (up === 0)
			this.evaluateMove(paddle.z - paddle.speed);
		if (down === 0)
			this.evaluateMove(paddle.z + paddle.speed);

		return still >= up && still >= down ? 0:
			up >= down ? -1:
			1;
	}

	evaluateMove(z)
	{
		const paddle = this.copyPaddle(this.AIPaddle);

		const halfCourt = this.game.field.geometry.parameters.depth / 2;
		const halfPaddle = paddle.depth / 2;
		const bottomPaddle = paddle.z + halfPaddle;
		const topPaddle = paddle.z - halfPaddle;

		// Copy ball as currently known
		const ball = this.copyBall(this.ball);
		console.log('ball: ', ball)
		
		if (ball.dx > 0)
			ball.dx *= -1;
		ball.x = paddle.x - paddle.width / 2 - ball.radius + ball.dx;
		ball.z = this.destination;
		
		paddle.z = z

		if (topPaddle < -halfCourt || bottomPaddle > halfCourt)
			return 0;
		if (ball.z + ball.radius < topPaddle || ball.z - ball.radius > bottomPaddle)
			return 0;

		ball.dz = (ball.z - paddle.z) * ball.angleMultiplier;
		console.log('ball:', ball, ' paddle:', paddle);

		const value = this.predictBallZ(ball);
		console.log('Ball will end up:', value);
		console.log('Human paddle is at:', this.humanPaddle.z);
		console.log('Actual human paddle is at:', this.game.paddle1.z);

		return Math.abs(this.humanPaddle.z - value);
	}

	predictBallZ(ball) {
		// to avoid infinite loops, ball.dz is not allowed to be 1
		if (Math.abs(ball.dz) >= 1) {
			ball.dz = 0.9;
		}
		const halfCourt = this.game.field.geometry.parameters.depth / 2;
		const ballRadius = ball.radius;
		const ballSide = ball.x - ballRadius;
		const distanceToPaddle = Math.abs(ballSide - this.humanPaddle.x - this.humanPaddle.geometry.parameters.width / 2) + Math.abs(ball.dx);
		const ballDestination = ball.z + ball.dz / Math.abs(ball.dx) * distanceToPaddle;
		
		// if ball is moving towards a paddle, return the destination
		if (Math.abs(ballDestination) + ballRadius < halfCourt) {
			return ballDestination;
		}

		// if the ball is moving towards one of the walls, recurse
		const wall = ball.dz > 0 ? halfCourt : -halfCourt;
		const distanceToWall = Math.abs(wall - ball.z) - ballRadius + Math.abs(ball.dx);
		const timeToWall = distanceToWall / Math.abs(ball.dz);
		ball.x = ball.x + timeToWall * ball.dx;
		ball.z = wall < 0 ? wall + ballRadius : wall - ballRadius;
		ball.dz = -ball.dz;
		return this.predictBallZ(ball);
	}

	copyPaddle(paddle) {
		const newPaddle = {};
		newPaddle.x = paddle.x;
		newPaddle.z = paddle.z;
		newPaddle.width = paddle.geometry.parameters.width;
		newPaddle.depth = paddle.geometry.parameters.depth;
		newPaddle.speed = paddle.speed;
		return newPaddle;
	}
	
	copyBall(ball) {
		const newBall = {};
		newBall.x = ball.x;
		newBall.z = ball.z;
		newBall.dx = ball.dx;
		newBall.dz = ball.dz;
		newBall.radius = ball.geometry.parameters.radius;
		newBall.angleMultiplier = ball.angleMultiplier;
		return newBall;
	}

}

export { AI }
