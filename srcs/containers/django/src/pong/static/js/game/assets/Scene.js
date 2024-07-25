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