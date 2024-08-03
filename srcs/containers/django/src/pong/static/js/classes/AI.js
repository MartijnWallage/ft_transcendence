import { abs, getRandomInt } from '../utils.js';

class AI {
	constructor(game) {
		this.game = game;
		this.destination = 0;
		this.side = 1;
        this.lastUpdateTime = 0;
        this.updateInterval = 1000; // 1000 milliseconds = 1 second
        this.init();
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

    // Actual method to update the game view
    updateDestination() {
		const ball = {};
		ball.x = this.game.ball.position.x;
		ball.z = this.game.ball.position.z;
		ball.dx = this.game.ball.dx;
		ball.dz = this.game.ball.dz;

		const humanPaddle = {};
		humanPaddle.x = this.game.paddle1.x;
		humanPaddle.z = this.game.paddle1.z;

		this.destination = this.recursiveUpdateDestination(ball, humanPaddle);
    }

	recursiveUpdateDestination(ball, humanPaddle) {
		// to avoid infinite loops, ball.dz is not allowed to be 1
		if (abs(ball.dz) >= 1) {
			ball.dz = 0.9;
		}
		const halfCourt = this.game.field.geometry.parameters.depth / 2;
		const paddleHalfDepth = this.game.paddle2.geometry.parameters.depth / 2;
		const paddleHalfWidth = this.game.paddle2.geometry.parameters.width / 2;
		const ballRadius = this.game.ball.geometry.parameters.radius;

		const paddle = ball.dx < 0 ? humanPaddle : this.game.paddle2;
		const paddleTop = paddle.z - paddleHalfDepth;
		const paddleBottom = paddle.z + paddleHalfDepth;
		const paddleSide = ball.dx < 0 ? paddle.x + paddleHalfWidth : paddle.x - paddleHalfWidth;
		const ballSide = ball.dx < 0 ? ball.x - ballRadius : ball.x + ballRadius;

		const distanceToPaddle = abs(ballSide - paddleSide);
		const ballDestination = ball.z + ball.dz / abs(ball.dx) * distanceToPaddle;
		
		// if ball is moving towards the AI paddle, return the destination
		if (ball.dx > 0 && abs(ballDestination) + ballRadius < halfCourt) {
			return ballDestination;
		}

		// if the ball is moving towards one of the walls, recurse
		if (abs(ballDestination) + ballRadius > halfCourt) {
			const wall = ball.dz > 0 ? halfCourt : -halfCourt;
			const distanceToWall = abs(wall - ball.z) - ballRadius;
			const timeToWall = distanceToWall / abs(ball.dz);
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
			ball.dz = (ballDestination - humanPaddle.z) * this.game.ball.angleMultiplier;
			return this.recursiveUpdateDestination(ball, humanPaddle);
		}
	}

	movePaddle(paddle) {
		const bottomPaddle = paddle.z + paddle.geometry.parameters.depth / 2;
		const topPaddle = paddle.z - paddle.geometry.parameters.depth / 2;
		const edgeStrategy = getRandomInt(0, 2) ? this.game.ball.geometry.parameters.radius : 0;
	
		return this.destination + edgeStrategy < topPaddle ? -1 : 
				this.destination - edgeStrategy > bottomPaddle ? 1 : 
				0;
	}
}

export { AI }
