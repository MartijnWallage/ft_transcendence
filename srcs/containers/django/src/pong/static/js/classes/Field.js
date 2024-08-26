import * as THREE from '../three-lib/three.module.js';

class Field {
	constructor(scene, length, width) {
        this.scene = scene;
		this.geometry = new THREE.BoxGeometry(length, 0.5, width);
		this.material = new THREE.MeshStandardMaterial({
			color: 0x0a1826,
			roughness: 0.5,
			metalness: 0.5
		});
		this.mesh = new THREE.Mesh(this.geometry, this.material);
		this.scene.add(this.mesh);

		this.net_geometry = new THREE.BoxGeometry(0.3, this.geometry.parameters.height + 0.01, width - 0.2);
		this.net_material = new THREE.MeshStandardMaterial({
			color: 0xc1d1db,
			roughness: 0.5,
			metalness: 0.5
		});
		this.net = new THREE.Mesh(this.net_geometry, this.net_material);
		this.scene.add(this.net);
	}

    remove() {
        this.scene.remove(this.mesh);
        this.scene.remove(this.net);
    }

	get position() {
		return this.mesh.position;
	}
}

export { Field };