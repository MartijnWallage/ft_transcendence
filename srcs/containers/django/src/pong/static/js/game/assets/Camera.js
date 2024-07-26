import * as THREE from '../utils/three.module.js';

class Camera {
	constructor() {
		this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
		this.camera.position.set(0, 0.9, 0);
		this.camera.lookAt(0, 1, 0);
		this.rotateAngle = 0.8;
	}

	orbitCamera() {
		this.rotateAngle += 0.006; // Adjust this value to change the speed of orbit
		const radius = 6;
		//console.log(angle);
		this.camera.position.x = radius * Math.cos(this.rotateAngle);
		this.camera.position.z = radius * Math.sin(this.rotateAngle);
		this.camera.lookAt(0, 1, 0);
	}

	renderMenuView(scene) {
		this.orbitCamera();
		const left = Math.floor( window.innerWidth * 0 );
		const bottom = Math.floor( window.innerHeight * 0 );
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
		const left = Math.floor( window.innerWidth * 0 );
		const bottom = Math.floor( window.innerHeight * 0 );
		const width = Math.floor( window.innerWidth * 1 );
		const height = Math.floor( window.innerHeight * 1 );
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
		const bottom = Math.floor( window.innerHeight * 0 );
		const width = Math.floor( window.innerWidth * 0.5 );
		const height = Math.floor( window.innerHeight * 1 );
		scene.renderer.setViewport( left, bottom, width, height );
		scene.renderer.setScissor( left, bottom, width, height );
		scene.renderer.setScissorTest(true);
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
		scene.renderer.render(scene.scene, this.camera);
	}
}

export { Camera };