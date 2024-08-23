import * as THREE from '../three-lib/three.module.js';
import { abs, getRandomInt } from '../utils.js';

class AI {
	constructor(game) {
		// settings
		this.level = 2;
		this.side = 1; // Not used right now. But ideally, the AI should be able to play on either side
        this.updateInterval = 1000 / this.level; // 1000 milliseconds = 1 second
		this.visualizePrediction = true;
		
		this.game = game;
		this.predictionBallZ = 0;
        this.lastUpdateTime = 0;
        this.init();
		this.humanPaddle = this.game.paddle1;
		this.AIPaddle = this.game.paddle2;
		this.bestPaddlePosition = 0;
		
		// visualize prediction
		this.radius = 0.1;
		this.geometry = new THREE.SphereGeometry(this.radius);
		this.material = new THREE.MeshStandardMaterial({
			color: 0x008000,
			roughness: 0.4,
			metalness: 0.3,
		});
		this.mesh = new THREE.Mesh(this.geometry, this.material);
		this.mesh.position.set(this.AIPaddle.x - this.AIPaddle.geometry.parameters.width / 2, 0.7, this.predictionBallZ);
		if (this.visualizePrediction)
			this.game.scene.add(this.mesh);
	}
	
    // Method to initialize the interval
    init() {
		setInterval(() => this.refreshView(), this.updateInterval);
    }
	
	setAim(paddle) {
		const halfCourt = this.game.field.geometry.parameters.depth / 2;
		let aimUpper = -halfCourt + this.game.ball.radius;
		let aimLower = halfCourt - this.game.ball.radius;

		const aimStraight = getRandomInt(0, 5);
		if (aimStraight === 0) {
			const temp = aimUpper;
			aimUpper = aimLower;
			aimLower = temp;
		}

		return paddle.z > 0 ? aimUpper : aimLower;
	}

    // Method to refresh the AI's view of the game
    refreshView() {
		if (!this.game.running || this.game.ball.dx == 0) {
			return;
		}
        const currentTime = Date.now();
        if (currentTime - this.lastUpdateTime >= this.updateInterval) {
			this.lastUpdateTime = currentTime;
			const ball = this.copyBall(this.game.ball);
			const humanPaddle = this.copyPaddle(this.humanPaddle);
			this.predictionBallZ = this.simulateBall(ball, humanPaddle);
			let aim = this.setAim(humanPaddle);
			this.bestPaddlePosition = this.findPaddlePosition(ball, aim);
			this.mesh.position.set(this.AIPaddle.x - this.AIPaddle.geometry.parameters.width / 2, 0.7, this.predictionBallZ);
        }
    }

	checkCourtCollision(ball) {
		const topBall = ball.z - ball.radius;
		const bottomBall = ball.z + ball.radius;
		const halfCourt = this.game.field.geometry.parameters.depth / 2;
		const topCourt = -halfCourt;
		const bottomCourt = halfCourt;
		
		return (ball.dz > 0 && bottomBall > bottomCourt)
			|| (ball.dz < 0 && topBall < topCourt);
	}
	
	simulateBall(ball, humanPaddle) {
		// simulate animate ball
		ball.x += ball.dx;
		ball.z += ball.dz;
		const leftSidePaddle = this.AIPaddle.x - this.AIPaddle.geometry.parameters.width / 2;
		// if ball is at the AI's side, return the ball's z position
		if (ball.dx > 0 && ball.x + ball.radius > leftSidePaddle) {
			return ball.z;
		}
		const halfCourt = this.game.field.geometry.parameters.depth / 2;
		const rightSidePaddle = humanPaddle.x + humanPaddle.width / 2;
		if (ball.x + ball.radius < rightSidePaddle) {
			const paddleTop = humanPaddle.z - humanPaddle.depth / 2;
			const paddleBottom = humanPaddle.z + humanPaddle.depth / 2;
			const paddleHalfDepth = humanPaddle.depth / 2;
			// Assume the human paddle will reach the ball
			if (paddleTop > ball.z + ball.radius) {
				humanPaddle.z = ball.z + paddleHalfDepth / 2;
				// if ball is in upper corner, move paddle to corner
				if (ball.z < -halfCourt + paddleHalfDepth)
					humanPaddle.z = -halfCourt + paddleHalfDepth;
			} else if (paddleBottom < ball.z - ball.radius) {
				humanPaddle.z = ball.z - paddleHalfDepth / 2;
				// if ball is in lower corner, move paddle to corner
				if (ball.z > halfCourt - paddleHalfDepth)
					humanPaddle.z = halfCourt - paddleHalfDepth;
			}		
			// simulate ball hitting paddle
			ball.dz = (ball.z - humanPaddle.z) * ball.angleMultiplier;
			ball.dx *= (abs(ball.dx) < ball.initialSpeed / 1.5) ? -2 : -ball.accelerate;
		}
		// simulate ball hitting wall
		if (this.checkCourtCollision(ball)) {
			ball.dz = -ball.dz;
		}
		return this.simulateBall(ball, humanPaddle);
	}

	findPaddlePosition(ball, aim) {
		const halfPaddle = this.game.paddle2.geometry.parameters.depth / 2;
		ball.x = this.game.paddle2.x - halfPaddle - ball.radius + ball.dx;
		const paddle1RightSide = this.game.paddle1.x + halfPaddle;
		
		ball.z = this.predictionBallZ;
		ball.dx *= (abs(ball.dx) < ball.initialSpeed / 1.5) ? -2 : -ball.accelerate;
		const distanceBetweenPaddles = ball.x - paddle1RightSide - ball.radius;
		const steps = distanceBetweenPaddles / abs(ball.dx) + 1;
		const desiredDz = (aim - ball.z) / steps;
		let bestPaddlePosition = ball.z - (desiredDz / ball.angleMultiplier);

		const halfCourt = this.game.field.geometry.parameters.depth / 2;
		if (bestPaddlePosition - halfPaddle < -halfCourt ||
			bestPaddlePosition + halfPaddle > halfCourt ||
			abs(ball.z - bestPaddlePosition) > halfPaddle + ball.radius) {
			bestPaddlePosition = this.AIPaddle.z < ball.z ? 
									ball.z - halfPaddle:
									ball.z + halfPaddle;
		}
		return bestPaddlePosition;
	}

	movePaddle(paddle) {
		let aim = this.predictionBallZ;
		if (this.level >= 2)
			aim = this.bestPaddlePosition;
		return paddle.z + paddle.speed < aim ? 1 : 
			paddle.z - paddle.speed > aim ? -1:
			0;
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
		newBall.angleMultiplier = ball.angleMultiplier;
		newBall.initialSpeed = ball.initialSpeed;
		newBall.accelerate = ball.accelerate;
		return newBall;
	}

}

export { AI }
