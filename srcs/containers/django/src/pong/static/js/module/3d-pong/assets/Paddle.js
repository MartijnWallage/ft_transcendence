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
	this.mesh.position.set(distanceFromCenter, (0.8 / 2) + 0.5 , 0);
	scene.add(this.mesh);
	this.speed = 0.15;
	}
    
	movePaddle(direction, field ) {
        this.mesh.position.z += direction * this.speed;
   
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
}

export { Paddle };