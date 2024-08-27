import * as THREE from '../three-lib/three.module.js';
import { getRandomInt, abs } from '../utils.js'; 

class Ball {
	constructor(game) {
		this.audio = null;
		this.game = game;
		this.scene = this.game.scene;
		this.radius = 0.3;
		this.geometry = new THREE.SphereGeometry(this.radius);
		this.material = new THREE.MeshStandardMaterial({
			color: 0xc70000,
			roughness: 0.4,
			metalness: 0.8,
			flatShading: true
		});
		this.mesh = new THREE.Mesh(this.geometry, this.material);
		this.mesh.position.set(0, 0.7, 0);
		this.resetBall();
		this.serve = 1;
		this.dx = 0;
		this.dz = 0;
		this.angleMultiplier = 0.2;
		this.accelerate = 1.01;
		this.scene.add(this.mesh);
	}

    remove() {
        this.scene.remove(this.mesh);
    }

	addAudio(audio) {
		this.audio = audio;
	}

	checkPaddleCollision(paddle) {
		const topPaddle = paddle.position.z - paddle.geometry.parameters.depth / 2;
		const bottomPaddle = paddle.position.z + paddle.geometry.parameters.depth / 2;
		const leftSidePaddle = paddle.position.x - paddle.geometry.parameters.width / 2;
		const rightSidePaddle = paddle.position.x + paddle.geometry.parameters.width / 2;
		const topBall = this.position.z - this.radius;
		const bottomBall = this.position.z + this.radius;
		const leftSideBall = this.position.x - this.radius;
		const rightSideBall = this.position.x + this.radius;

		return (bottomBall >= topPaddle && topBall <= bottomPaddle) &&
			((this.dx < 0 && leftSideBall <= rightSidePaddle && rightSideBall >= leftSidePaddle) ||
			(this.dx > 0 && rightSideBall >= leftSidePaddle && leftSideBall <= rightSidePaddle));
	}

	tryPaddleCollision(paddle_p1, paddle_p2) {
		const paddle = this.dx > 0 ? paddle_p2 : paddle_p1;

		if (this.checkPaddleCollision(paddle)) {
			this.dz = (this.position.z - paddle.position.z) * this.angleMultiplier;
            const speed = this.game.settings.ballSpeed;
			this.dx *= (abs(this.dx) < speed / 1.5) ? -2 : -this.accelerate;
			if (this.audio && paddle === paddle_p1) {
				this.audio.playSound(this.audio.ping);
			} else if (this.audio) {
				this.audio.playSound(this.audio.pong);
			}
		}
	}

	checkCourtCollision(court) {
		const topBall = this.position.z - this.radius;
		const bottomBall = this.position.z + this.radius;
		const halfCourt = court.geometry.parameters.depth / 2;
		const topCourt = -halfCourt;
		const bottomCourt = halfCourt;
		
		return (this.dz > 0 && bottomBall > bottomCourt)
			|| (this.dz < 0 && topBall < topCourt);
	}

	tryCourtCollision(court) {
		if (this.checkCourtCollision(court)) {
			this.dz *= -1;
		}
	}

	animateBall() {
		this.position.x += this.dx;
		this.position.z += this.dz;
	}

	resetBall() {
		this.position.x = 0;
		this.position.z = 0;
		this.dx = 0;
		this.dz = 0;
	}

	serveBall() {
		this.position.x = 0;
		this.position.z = 0;
		this.serve *= -1;
		this.dx = this.game.settings.ballSpeed * this.serve / 2;
		this.dz = getRandomInt(-7.5, 7.5) / 100;
	}

	setPosition(position) {
        this.mesh.position.x = position.x;
        this.mesh.position.z = position.z;
    }

    getPosition() {
        return {
            x: this.mesh.position.x,
            z: this.mesh.position.z
        };
    }

	get position() {
		return this.mesh.position;
	}

	get x() {
		return this.mesh.position.x;
	}

	get z() {
		return this.mesh.position.z;
	}
	
}

export { Ball };