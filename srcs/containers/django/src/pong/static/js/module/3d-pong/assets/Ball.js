import * as THREE from '../three.module.js';

class Ball {
	constructor(scene) {
	this.radius = 0.4;
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
	this.speed = 0.1;
	scene.add(this.mesh);
	}

	checkCollisionPaddle(paddle) {
		if (this.position.x - this.radius < paddle.position.x + paddle.geometry.parameters.width / 2 &&
				this.position.x + this.radius > paddle.position.x - paddle.geometry.parameters.width / 2 &&
				this.position.z - this.radius < paddle.position.z + paddle.geometry.parameters.depth / 2 &&
				this.position.z + this.radius > paddle.position.z - paddle.geometry.parameters.depth / 2) {
				this.dz = (this.position.z - (paddle.position.z)) * 0.15;
				this.dx *= -1.03;
				// hit.play(); // uncomment to play sound on hit
			}
	}

	checkCollisionField(field){
		if (this.position.x - this.radius < field.position.x - field.geometry.parameters.width / 2 ||
				this.position.x + this.radius > field.position.x + field.geometry.parameters.width / 2) {
				this.dx *= -1.03;
			}
		if (this.position.z - this.radius < field.position.z - field.geometry.parameters.depth / 2 ||
				this.position.z + this.radius > field.position.z + field.geometry.parameters.depth / 2) {
				this.dz *= -1;
			}
	}

	animateBall(){
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
		this.dx = this.speed * this.serve;
		this.dz = 0;
	}

	get position() {
		return this.mesh.position;
	}
}

export { Ball };