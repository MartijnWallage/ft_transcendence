import * as THREE from '../three-lib/three.module.js';

class Paddle {
	constructor (game, left, width = 2) {
        this.game = game;
        this.field = this.game.field;
        this.scene = this.game.scene;
		this.geometry = new THREE.BoxGeometry(0.3, 0.8, width);
		this.material = new THREE.MeshStandardMaterial({
			color: 0xc1d1db,
			roughness: 0.5,
			metalness: 0.5
		});
		this.offset = this.field.geometry.parameters.width / 15;
		let distanceFromCentre = this.field.geometry.parameters.width / 2 - this.offset;
		if (left) {
			distanceFromCentre *= -1;
		}
		this.mesh = new THREE.Mesh(this.geometry, this.material);
		this.mesh.position.set(distanceFromCentre, 0.9, 0);
		this.scene.add(this.mesh);
	}
	
	movePaddle(direction) {
		this.mesh.position.z += direction * this.game.settings.paddleSpeed;
   
		// if paddle is beyond the edge of field, move it back in
		const halfPaddle = this.geometry.parameters.depth / 2;
		const halfField = this.field.geometry.parameters.depth / 2;
		const topPaddle = this.mesh.position.z + halfPaddle;
		const bottomPaddle = this.mesh.position.z - halfPaddle;
	
		if (bottomPaddle < -halfField) {
			this.mesh.position.z = halfPaddle - halfField;
		} else if (topPaddle > halfField) {
			this.mesh.position.z = halfField - halfPaddle;
		}
	};

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

export { Paddle };