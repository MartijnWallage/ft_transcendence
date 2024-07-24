import * as THREE from '../three.module.js';
import { Ball } from './Ball.js';
import { Field } from './Field.js';
import { Paddle } from './Paddle.js';
import { Camera } from './Camera.js';
import { Environment } from './Environment.js';
import { OrbitControls } from '../OrbitControls.js';

class Scene {
	constructor(container){
	this.container = container;
	this.scene = new THREE.Scene();
	this.renderer = new THREE.WebGLRenderer({ antialias: true });
	this.camera = new Camera;
	this.renderer.setSize(window.innerWidth, window.innerHeight);
	this.renderer.setClearColor(0xc1d1db);
	this.container.appendChild(this.renderer.domElement);
	
	this.paddle_p1 = new Paddle(this.scene, -7);
	this.paddle_p2 = new Paddle(this.scene, 7);
	this.ball = new Ball(this.scene);
	this.field = new Field(this.scene);
	this.environment = new Environment(this.scene);
	this.controls = new OrbitControls(this.camera, this.container);

	// Add audio listener to the camera
	const listener = new THREE.AudioListener();
	camera.add(listener);

	// Create a global audio source
	const hit = new THREE.Audio(listener);

	// Load a sound and set it as the Audio object's buffer
	const audioLoader = new THREE.AudioLoader();
				audioLoader.load('./static/audio/hit.wav', function(buffer) {
						hit.setBuffer(buffer);
						hit.setLoop(false);
						hit.setVolume(1.0);
				});
	}

	onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
	}
}

export { Scene };