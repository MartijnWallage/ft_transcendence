import * as THREE from '../three.module.js';

class Paddle {
	constructor (scene, distanceFromCenter, width = 2) {
	this.geometry = new THREE.BoxGeometry(0.3, 0.8, width);
	this.material = new THREE.MeshStandardMaterial({
		color: 0xc1d1db,
		roughness: 0.5,
		metalness: 0.5
	});
	this.mesh = new THREE.Mesh(this.geometry, this.material);
	this.mesh.position.set(distanceFromCenter ,(0.8 / 2) + 0.5 , 0);
	scene.add(this.mesh);
	this.speed = 0.2;
	}

	movePaddles(left, right, field) {
		if (left && this.position.z - this.geometry.parameters.depth / 2 >
			field.position.z - field.geometry.parameters.depth / 2) {
					this.position.z -= this.speed;
		}
		if (right && this.position.z + this.geometry.parameters.depth / 2 <
				field.position.z + field.geometry.parameters.depth / 2) {
					this.position.z += this.speed;
		}
	};

	get position() {
		return this.mesh.position;
	}
}

export { Paddle };