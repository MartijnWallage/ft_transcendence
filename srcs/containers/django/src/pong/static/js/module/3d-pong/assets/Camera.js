import * as THREE from '../utils/three.module.js';

class Camera {
	constructor(scene){
	this.cam = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
	this.cam.position.set(0, 0.9, 0);
	this.cam.lookAt(0, 1, 0);
	this.rotateAngle = 0.8;
	}

	orbitCamera() {
	this.rotateAngle += 0.008; // Adjust this value to change the speed of orbit
	const radius = 6;
	//console.log(angle);
	this.cam.position.x = radius * Math.cos(this.rotateAngle);
	this.cam.position.z = radius * Math.sin(this.rotateAngle);
	this.cam.lookAt(0, 1, 0);
	}
}

export { Camera };