import * as THREE from '../three-lib/three.module.js';

class Field {
	constructor(scene) {
		this.geometry = new THREE.BoxGeometry(16, 0.5, 12);
		this.material = new THREE.MeshStandardMaterial({
			color: 0x0a1826,
			roughness: 0.5,
			metalness: 0.5
		});
		this.mesh = new THREE.Mesh(this.geometry, this.material);
		scene.add(this.mesh);

		this.net_geometry = new THREE.BoxGeometry(0.3, 0.51, 11.8);
		this.net_material = new THREE.MeshStandardMaterial({
			color: 0xc1d1db,
			roughness: 0.5,
			metalness: 0.5
		});
		this.net = new THREE.Mesh(this.net_geometry, this.net_material);
		scene.add(this.net);
	}

	get position() {
		return this.mesh.position;
	}
}

export { Field };