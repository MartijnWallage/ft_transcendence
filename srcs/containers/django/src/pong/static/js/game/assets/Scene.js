import * as THREE from '../three-lib/three.module.js';
import { Ball } from './Ball.js';
import { Field } from './Field.js';
import { Paddle } from './Paddle.js';
import { Camera } from './Camera.js';
import { Audio } from './Audio.js';
import { Environment } from './Environment.js';
import { OrbitControls } from '../three-lib/OrbitControls.js';

class Scene {
	constructor(container) {
		this.scene = new THREE.Scene();
		this.renderer = new THREE.WebGLRenderer({container}, { antialias: true });
		this.cam1 = new Camera;
		this.cam2 = new Camera;
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setClearColor(0xc1d1db);
		container.appendChild(this.renderer.domElement);

		this.field = new Field(this.scene);
		this.paddle_p1 = new Paddle(this.scene, this.field, true);
		this.paddle_p2 = new Paddle(this.scene, this.field, false);
		this.ball = new Ball(this.scene);
		this.environment = new Environment(this.scene);
		this.controls = new OrbitControls(this.cam1.camera, container);
		this.audio = null;
		

		document.addEventListener('click', () => this.createAudioContext());
	}

	createAudioContext() {
		console.log('createAudioContext');
		this.audio = new Audio(this.cam1);
		document.removeEventListener('click', createAudioContext);
		}

	onWindowResize() {
			this.renderer.setSize( window.innerWidth, window.innerHeight );
	}
}

export { Scene };