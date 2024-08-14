/* Some possible improvements
 * Write a function that will predict the ball's z position on the other side, given the current ball and paddle position
 * Use this function to make decisions about where to move the paddle. Try to hit away from the human paddle
 * Incorporate PID control to deal with errors in the prediction
 */

import { abs, getRandomInt } from '../utils.js';

class AI {
	constructor(game) {
		this.game = game;
		this.destination = 0;
		this.side = 1;
        this.lastUpdateTime = 0;
        this.updateInterval = 1000; // 1000 milliseconds = 1 second
        this.init();
		this.humanPaddle = this.game.paddle1;
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

    // Actual method to update the game view
    updateDestination() {
		const ball = this.copyBall(this.game.ball);
		const humanPaddle = this.copyPaddle(this.humanPaddle);
		if (abs(ball.dx) > 0)
			this.destination = this.recursiveUpdateDestination(ball, humanPaddle);
    }

	computeBallStraightLine(ball) {
		// to avoid infinite loops, ball.dz is not allowed to be 1
		const paddle = ball.dx < 0 ? this.game.paddle1 : this.game.paddle2;
		const paddleHalfWidth = paddle.geometry.parameters.width / 2;
		const ballRadius = ball.radius;
		
		const paddleSide = ball.dx < 0 ? paddle.x + paddleHalfWidth : paddle.x - paddleHalfWidth;
		const ballSide = ball.dx < 0 ? ball.x - ballRadius : ball.x + ballRadius;

		const distanceToPaddle = abs(ballSide - paddleSide) + abs(ball.dx); // + abs(ball.dz) because the ball never hits the paddle precisely
		const ballDestination = ball.z + ball.dz / abs(ball.dx) * distanceToPaddle;
		return ballDestination;
	}
	
	computeNextBallZ(ball) {
		const halfCourt = this.game.field.geometry.parameters.depth / 2;
		const ballZ = this.computeBallStraightLine(ball);
		// if ball is moving towards a paddle, return the destination
		if (abs(ballZ) + ball.radius < halfCourt) {
			return ballZ;
		}
		// else, the ball is moving towards a wall
		const wall = ball.dz > 0 ? halfCourt : -halfCourt;
		const distanceToWall = abs(wall - ball.z) - ball.radius + abs(ball.dz); // + abs(ball.dz) because the ball never hits the wall precisely
		const timeToWall = distanceToWall / abs(ball.dz);
		ball.x = ball.x + timeToWall * ball.dx + ball.dx;
		ball.z = wall < 0 ?
		wall + ball.radius :
		wall - ball.radius;
		ball.dz = -ball.dz;
		return this.computeNextBallZ(ball);
	}
	
	recursiveUpdateDestination(ball, humanPaddle) {
		if (abs(ball.dz) >= 1) {
			ball.dz = 0.9;
		}
		const ballDestination = this.computeNextBallZ(ball);
		
		// if ball is moving towards the AI paddle, return the destination
		if (ball.dx > 0) {
			return ballDestination;
		}
		
		// if the ball is moving towards the human paddle, recurse
		const paddleHalfDepth = humanPaddle.depth / 2;
		const paddleHalfWidth = humanPaddle.width / 2;
		const ballRadius = ball.radius;
		
		const paddle = ball.dx < 0 ? humanPaddle : this.game.paddle2;
		const paddleTop = paddle.z - paddleHalfDepth;
		const paddleBottom = paddle.z + paddleHalfDepth;
		const paddleSide = ball.dx < 0 ? paddle.x + paddleHalfWidth : paddle.x - paddleHalfWidth;
		ball.z = ballDestination;
		ball.x = paddleSide + ballRadius + ball.dx;
		ball.dx = -ball.dx;
			
		// Assume the human paddle will reach the ball
		if (paddleTop > ballDestination) {
			humanPaddle.z = ballDestination + paddleHalfDepth;
		} else if (paddleBottom < ballDestination) {
			humanPaddle.z = ballDestination - paddleHalfDepth;
		}
		ball.dz = (ballDestination - humanPaddle.z) * this.game.ball.angleMultiplier;
		return this.computeNextBallZ(ball);
	}
	
	movePaddle(paddle) {
		return this.PickfordDefense(paddle);
	}
			
			
	PickfordDefense(paddle) {
		const bottomPaddle = paddle.z + paddle.geometry.parameters.depth / 2;
		const topPaddle = paddle.z - paddle.geometry.parameters.depth / 2;
		const edgeStrategy = this.game.ball.geometry.parameters.radius;
		
		if (this.AIPaddle.dz > 0 && this.destination + edgeStrategy < topPaddle) {
			this.AIPaddle.dz = -this.AIPaddle.dz;
		} else if (this.AIPaddle.dz < 0 && this.destination - edgeStrategy > bottomPaddle) {
			this.AIPaddle.dz = -this.AIPaddle.dz;
		}

		return this.AIPaddle.dz;
	}

	aim() {
		// Predict where the ball will end up when we move the paddle up, down, or stay still
		// Choose the option that will result in the ball being farther from the human paddle
	}

	copyPaddle(paddle) {
		const newPaddle = {};
		newPaddle.x = paddle.x;
		newPaddle.z = paddle.z;
		newPaddle.width = paddle.geometry.parameters.width;
		newPaddle.depth = paddle.geometry.parameters.depth;
		return newPaddle;
	}
	
	copyBall(ball) {
		const newBall = {};
		newBall.x = ball.x;
		newBall.z = ball.z;
		newBall.dx = ball.dx;
		newBall.dz = ball.dz;
		newBall.radius = ball.geometry.parameters.radius;
		return newBall;
	}

}

export { AI }
