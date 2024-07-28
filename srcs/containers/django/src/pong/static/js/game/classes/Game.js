import * as THREE from '../three-lib/three.module.js';
import { Ball } from './Ball.js';
import { Field } from './Field.js';
import { Paddle } from './Paddle.js';
import { AI } from './AI.js';
import { Camera } from './Camera.js';
import { Audio } from './Audio.js';
import { Environment } from './Environment.js';
import { OrbitControls } from '../three-lib/OrbitControls.js';

class Game {
	constructor(container) {
		this.scene = new THREE.Scene();
		this.renderer = new THREE.WebGLRenderer({container}, { antialias: true });
		this.cam1 = new Camera;
		this.cam2 = new Camera;
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setClearColor(0xc1d1db);
		container.appendChild(this.renderer.domElement);

		this.field = new Field(this.scene);
		this.paddle1 = new Paddle(this.scene, this.field, true);
		this.paddle2 = new Paddle(this.scene, this.field, false);
		this.ball = new Ball(this.scene);
		this.ai = new AI();
		this.environment = new Environment(this.scene);
		this.controls = new OrbitControls(this.cam1.camera, container);
		this.audio = new Audio(this.cam1);

		this.playerNames = [];
		this.mode = '';
	}

/* 	startGame() {}
	pauseGame() {}
	endGame() {}
	startRound() {}
	endRound() {} */

	onWindowResize() {
		this.renderer.setSize( window.innerWidth, window.innerHeight );
	}
}

export { Game };