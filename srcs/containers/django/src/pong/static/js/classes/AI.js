import { abs } from '../utils.js';

class AI {
	constructor(game) {
		this.game = game;
		this.halfCourt = game.field.geometry.parameters.depth / 2;
		this.paddleX = game.paddle2.position.x;
		this.destination = 0;
		this.side = 1;
        this.lastUpdateTime = 0;
        this.updateInterval = 500; // 1000 milliseconds = 1 second
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

		if (ball.dx * this.side < 0) {
			this.destination = 0;
		} else {
			this.destination = this.recursiveUpdateDestination(ball);
		}
		console.log('AI destination:', this.destination);
    }

	recursiveUpdateDestination(ball) {
		const distanceToPaddle = abs(ball.x - this.paddleX);
		const ballDestination = ball.z + ball.dz / ball.dx * distanceToPaddle;
		
		if (abs(ballDestination) <= this.halfCourt) {
			return ballDestination;
		} else {
			const wall = ball.dz > 0 ? this.halfCourt : -this.halfCourt;
			const distanceToWall = abs(wall - ball.z);
			const timeToWall = distanceToWall / abs(ball.dz);
			ball.x = ball.x + timeToWall * ball.dx;
			ball.z = wall;
			ball.dz = -ball.dz;
			return this.recursiveUpdateDestination(ball);
		}
	}

	movePaddle(paddle, ball) {
		const bottomPaddle = paddle.position.z + paddle.geometry.parameters.depth / 2;
		const topPaddle = paddle.position.z - paddle.geometry.parameters.depth / 2;
/* 		const bottomBall = ball.position.z + ball.radius / 2;
		const topBall = ball.position.z - ball.radius / 2; */
	
		return this.destination < topPaddle ? -1 : 
			this.destination > bottomPaddle ? 1 : 
			0;
	}	
}

export { AI }
