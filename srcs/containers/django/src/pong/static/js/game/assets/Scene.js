import * as THREE from '../utils/three.module.js';
import { Ball } from './Ball.js';
import { Field } from './Field.js';
import { Paddle } from './Paddle.js';
import { Camera } from './Camera.js';
import { Audio } from './Audio.js';
import { Environment } from './Environment.js';
import { OrbitControls } from '../utils/OrbitControls.js';

class Scene {
	constructor(container) {
		this.scene = new THREE.Scene();
		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.camera = new Camera;
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setClearColor(0xc1d1db);
		container.appendChild(this.renderer.domElement);

		this.field = new Field(this.scene);
		this.paddle_p1 = new Paddle(this.scene, this.field, true);
		this.paddle_p2 = new Paddle(this.scene, this.field, false);
		this.ball = new Ball(this.scene);
		this.environment = new Environment(this.scene);
		this.controls = new OrbitControls(this.camera.cam, container);
		this.audio = new Audio(this.camera);
	}

	onWindowResize() {
		this.camera.cam.aspect = window.innerWidth / window.innerHeight;
		this.camera.cam.updateProjectionMatrix();
		this.renderer.setSize( window.innerWidth, window.innerHeight );
	}
}

export { Scene };

// const scene = new THREE.Scene();
// const renderer = new THREE.WebGLRenderer();
// renderer.setSize(window.innerWidth, window.innerHeight);
// document.body.appendChild(renderer.domElement);

// // Create two cameras
// const camera1 = new THREE.PerspectiveCamera(75, window.innerWidth / (window.innerHeight / 2), 0.1, 1000);
// camera1.position.z = 5;

// const camera2 = new THREE.PerspectiveCamera(75, window.innerWidth / (window.innerHeight / 2), 0.1, 1000);
// camera2.position.z = 5;
// camera2.position.x = 2;  // Slightly offset the second camera for a different view

// // Variable to track current aspect ratio
// let splitVertical = true;

// // Animation loop
// function animate() {
// 	requestAnimationFrame(animate);

// 	cube.rotation.x += 0.01;
// 	cube.rotation.y += 0.01;

// 	// Render the scene with the first camera
// 	if (splitVertical) {
// 		renderer.setViewport(0, 0, window.innerWidth / 2, window.innerHeight);
// 		renderer.render(scene, camera1);

// 		// Render the scene with the second camera
// 		renderer.setViewport(window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight);
// 		renderer.render(scene, camera2);
// 	} else {
// 		renderer.setViewport(0, window.innerHeight / 2, window.innerWidth, window.innerHeight / 2);
// 		renderer.render(scene, camera1);

// 		// Render the scene with the second camera
// 		renderer.setViewport(0, 0, window.innerWidth, window.innerHeight / 2);
// 		renderer.render(scene, camera2);
// 	}
// }

// animate();

// // Handle window resize
// window.addEventListener('resize', () => {
// 	renderer.setSize(window.innerWidth, window.innerHeight);
// 	if (splitVertical) {
// 		camera1.aspect = (window.innerWidth / 2) / window.innerHeight;
// 		camera2.aspect = (window.innerWidth / 2) / window.innerHeight;
// 	} else {
// 		camera1.aspect = window.innerWidth / (window.innerHeight / 2);
// 		camera2.aspect = window.innerWidth / (window.innerHeight / 2);
// 	}
// 	camera1.updateProjectionMatrix();
// 	camera2.updateProjectionMatrix();
// });

// // Toggle split orientation
// window.addEventListener('keydown', (event) => {
// 	if (event.key === 't') {
// 		splitVertical = !splitVertical;

// 		if (splitVertical) {
// 			camera1.aspect = (window.innerWidth / 2) / window.innerHeight;
// 			camera2.aspect = (window.innerWidth / 2) / window.innerHeight;
// 		} else {
// 			camera1.aspect = window.innerWidth / (window.innerHeight / 2);
// 			camera2.aspect = window.innerWidth / (window.innerHeight / 2);
// 		}
// 		camera1.updateProjectionMatrix();
// 		camera2.updateProjectionMatrix();
// 	}
// });