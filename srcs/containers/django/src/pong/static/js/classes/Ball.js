import * as THREE from '../three-lib/three.module.js';
import { getRandomInt, abs } from '../utils.js'; 

class Ball {
	constructor(scene) {
		this.scene = scene;
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
		this.initialSpeed = 0.2;
		scene.add(this.mesh);
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

    tryPaddleCollision(paddle_p1, paddle_p2, audio) {
        const paddle = this.dx > 0 ? paddle_p2 : paddle_p1;

        if (this.checkPaddleCollision(paddle)) {
            this.dz = (this.position.z - paddle.position.z) * 0.20;
            this.dx *= (abs(this.dx) < this.initialSpeed / 1.5) ? -2 : -1.01;
            audio.playSound(audio.hit);
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
		this.dx = this.initialSpeed * this.serve / 2;
		this.dz = getRandomInt(-7.5, 7.5) / 100;
	}

	get position() {
		return this.mesh.position;
	}
}

export { Ball };