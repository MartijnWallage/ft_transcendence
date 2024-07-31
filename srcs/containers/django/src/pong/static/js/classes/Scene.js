import * as THREE from '../three-lib/three.module.js';
import { Ball } from './Ball.js';
import { Field } from './Field.js';
import { Paddle } from './Paddle.js';
import { Camera } from './Camera.js';
import { Audio } from './Audio.js';
import { Environment } from './Environment.js';
import { OrbitControls } from '../three-lib/OrbitControls.js';

export class Scene {
	constructor() {
		const container = document.getElementById('threejs-container');
		this.threeScene = new THREE.Scene();
		this.renderer = new THREE.WebGLRenderer({container}, { antialias: true });
		this.cam1 = new Camera;
		this.cam2 = new Camera;
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setClearColor(0xc1d1db);
		container.appendChild(this.renderer.domElement);

		this.field = new Field(this.threeScene);
		this.paddle1 = new Paddle(this.threeScene, this.field, true);
		this.paddle2 = new Paddle(this.threeScene, this.field, false);
		this.ball = new Ball(this.threeScene);
		this.environment = new Environment(this.threeScene);
		this.controls = new OrbitControls(this.cam1.camera, container);
		this.audio = new Audio(this.cam1);
	}
}