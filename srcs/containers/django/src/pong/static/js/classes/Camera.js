import * as THREE from '../three-lib/three.module.js';
import { notDisplayDiv } from '../utils.js';

class Camera {
	constructor() {
		this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
		this.camera.position.set(0, 200, 0);
		this.camera.lookAt(0, 1, 0);
		this.rotateAngle = 0.8;
	}

	calculateFovToFitObject(objectWidth, distance, aspectRatio) {
		const fov = 2 * Math.atan((objectWidth / aspectRatio) / (2 * distance)) * (180 / Math.PI);
		this.camera.fov = fov;
		this.camera.updateProjectionMatrix();
	}

	orbitCamera() {
		this.rotateAngle += 0.005; // Adjust this value to change the speed of orbit
		const radius = 6;
		this.camera.position.x = radius * Math.cos(this.rotateAngle);
		this.camera.position.z = radius * Math.sin(this.rotateAngle);
		this.camera.lookAt(0, 1, 0);
	}

	easeInOutQuad(t) {
		return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
	}
	
	// Function to animate camera movement
	async introCameraAnimation() {
		let startY = 200;
		let endY = 0.9;
		let duration = 4500; // Duration in milliseconds
		let startTime = Date.now();
	
		while (true) {
			let elapsed = Date.now() - startTime;
			
			// Calculate the normalized time (from 0 to 1)
			let t = Math.min(elapsed / duration, 1);
	
			// Apply the easing function
			let easedT = this.easeInOutQuad(t);
	
			// Interpolate the camera position
			this.camera.position.y = startY + (endY - startY) * easedT;

			// Break the loop when animation is complete
			if (t >= 1) break;
	
			// Wait for the next frame
			await new Promise(resolve => setTimeout(resolve, 16)); // ~60fps
		}
	}

	renderMenuView(scene) {
		notDisplayDiv('vertical-line');
		this.orbitCamera();
		const left = 0;
		const bottom = 0;
		const width = Math.floor( window.innerWidth * 1 );
		const height = Math.floor( window.innerHeight * 1 );
		scene.renderer.setViewport( left, bottom, width, height );
		scene.renderer.setScissor( left, bottom, width, height );
		scene.renderer.setScissorTest(true);
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
		scene.renderer.render(scene.scene, this.camera);
	}

	renderSingleView(scene, position) {
		const left = 0;
		const bottom = 0;
		const width = window.innerWidth;
		const height = window.innerHeight;
		const x = position === 0 ? -14 : 14;
		this.camera.position.set(x, 14, 0);
		if (width < height){
			const objectWidth = 13;
			const cameraDistance = this.camera.position.distanceTo(new THREE.Vector3(-12, 0, 0));
			this.calculateFovToFitObject(objectWidth, cameraDistance, width / height);
		}
		else {
			this.camera.fov = 50;
		}
		this.camera.lookAt(0, -0.5, 0);
		scene.renderer.setViewport( left, bottom, width, height );
		scene.renderer.setScissor( left, bottom, width, height );
		scene.renderer.setScissorTest(true);
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
		scene.renderer.render(scene.scene, this.camera);
	}

	renderSplitView(scene, position) {
		const offset = position === 0 ? 0 : 0.5;
		const x = position === 0 ? -14 : 14;
		const dx = position === 0 ? -12 : 12;
		const left = Math.floor( window.innerWidth * offset);
		const bottom = 0;
		const width = Math.floor( window.innerWidth * 0.5 );
		const height = window.innerHeight;
		if (width < height){
			const objectWidth = 13;
			const cameraDistance = this.camera.position.distanceTo(new THREE.Vector3(dx, 0, 0));
			this.calculateFovToFitObject(objectWidth, cameraDistance, width / height);
		}
		else {
			this.camera.fov = 50;
		}
		this.camera.position.set(x, 14, 0);
		this.camera.lookAt(0, -0.5, 0);
		scene.renderer.setViewport( left, bottom, width, height );
		scene.renderer.setScissor( left, bottom, width, height );
		scene.renderer.setScissorTest(true);
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
		scene.renderer.render(scene.scene, this.camera);
	}
}

export { Camera };