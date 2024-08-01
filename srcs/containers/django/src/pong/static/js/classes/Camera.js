import * as THREE from '../three-lib/three.module.js';

class Camera {
	constructor() {
		this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
		// this.camera.position.set(0, 0.9, 0);
		this.camera.position.set(0, 200, 0);
		this.camera.lookAt(0, 1, 0);
		this.rotateAngle = 0.8;

		this.startY = 200;
		this.endY = 0.9;
		this.duration = 2000; // Duration in milliseconds
		this.startTime = null;
	}

	orbitCamera() {
		this.rotateAngle += 0.006; // Adjust this value to change the speed of orbit
		const radius = 6;
		//console.log(angle);
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
		let duration = 4000; // Duration in milliseconds
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
		const split = document.getElementById('vertical-line');
		split.style.display = 'none';
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

	renderSingleView(scene) {
		this.camera.position.set(-14, 14, 0);
		this.camera.lookAt(0, 1, 0);
		const left = 0;
		const bottom = 0;
		const width = window.innerWidth;
		const height = window.innerHeight;
		scene.renderer.setViewport( left, bottom, width, height );
		scene.renderer.setScissor( left, bottom, width, height );
		scene.renderer.setScissorTest(true);
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
		scene.renderer.render(scene.scene, this.camera);
	}

	renderSplitView(scene, position) {
		const x = position === 0 ? -14 : 14;
		this.camera.position.set(x, 14, 0);
		this.camera.lookAt(0, 1, 0);
		const offset = position === 0 ? 0 : 0.5;
		const left = Math.floor( window.innerWidth * offset);
		const bottom = 0;
		const width = Math.floor( window.innerWidth * 0.5 );
		const height = window.innerHeight;
		scene.renderer.setViewport( left, bottom, width, height );
		scene.renderer.setScissor( left, bottom, width, height );
		scene.renderer.setScissorTest(true);
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
		scene.renderer.render(scene.scene, this.camera);
	}
}

export { Camera };