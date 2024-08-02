import * as THREE from '../three-lib/three.module.js';

class Paddle {
	constructor (scene, court, left, width = 2) {
		this.geometry = new THREE.BoxGeometry(0.3, 0.8, width);
		this.material = new THREE.MeshStandardMaterial({
			color: 0xc1d1db,
			roughness: 0.5,
			metalness: 0.5
		});

		const paddleOffset = court.geometry.parameters.width / 15;
		let distanceFromCentre = court.geometry.parameters.width / 2 - paddleOffset;
		if (left) {
			distanceFromCentre *= -1;
		}
		this.mesh = new THREE.Mesh(this.geometry, this.material);
		this.mesh.position.set(distanceFromCentre, 0.9, 0);
		scene.add(this.mesh);
		this.speed = 0.2;
	}
	
	movePaddle(direction, field ) {
		this.mesh.position.z += direction * this.speed;
   
		// if paddle is beyond the edge of court, move it back in
		const halfPaddle = this.geometry.parameters.depth / 2;
		const halfField = field.geometry.parameters.depth / 2;
		const topPaddle = this.mesh.position.z + halfPaddle;
		const bottomPaddle = this.mesh.position.z - halfPaddle;
	
		if (bottomPaddle < -halfField) {
			this.mesh.position.z = halfPaddle - halfField;
		} else if (topPaddle > halfField) {
			this.mesh.position.z = halfField - halfPaddle;
		}
	};

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

export { Paddle };