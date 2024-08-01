import * as THREE from '../three-lib/three.module.js';
import { Tournament } from './Tournament.js';
import { Player } from './Player.js';
import { Match } from './Match.js';
import { Field } from './Field.js';
import { Paddle } from './Paddle.js';
import { Ball } from './Ball.js';
import { Environment } from './Environment.js';
import { Camera } from './Camera.js';
import { Audio } from './Audio.js';
import { OrbitControls } from '../three-lib/OrbitControls.js';
import { delay } from '../utils.js';

class Game {
	constructor() {
		// Scene
		const container = document.getElementById('threejs-container');
		this.scene = new THREE.Scene();
		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.cam1 = new Camera;
		this.cam2 = new Camera;
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setClearColor(0xc1d1db);
		container.appendChild(this.renderer.domElement);

		// Objects
		this.field = new Field(this.scene);
		this.paddle1 = new Paddle(this.scene, this.field, true);
		this.paddle2 = new Paddle(this.scene, this.field, false);
		this.ball = new Ball(this.scene);
		this.environment = new Environment(this.scene);
		this.controls = new OrbitControls(this.cam1.camera, container);
		this.audio = null;

		// Game state
		this.scoreToWin = 1;
		this.running = false;
		this.match = null;
		this.tournament = null;

		console.log('Game class created');
		this.createAudioContext = this.createAudioContext.bind(this);
		document.addEventListener('click', this.createAudioContext);	
	}

	// Create audio audio context once there is a first interaction with the website to comply with internet rules
	async createAudioContext() {
		this.audio = new Audio(this.cam1);
		document.removeEventListener('click', this.createAudioContext.bind(this));
		await delay(500); // crappy way to wait for the audio engigne to be fully loaded.
		this.audio.playSound(this.audio.woosh_1);
		this.cam1.introCameraAnimation();
		setTimeout(() => this.audio.playSound(this.audio.woosh_2),1200);
		setTimeout(() => this.audio.playSound(this.audio.chimes),2400);
		setTimeout(() => this.audio.playSound(this.audio.main),4000);
	}

	// These are the modes bound to the buttons in the menu
	startSolo() {
		const player1 = new Player('Guest');
		const player2 = new Player('pongAI');
		player2.setAI();
		this.match = new Match(this, [player1, player2]);
		this.match.play();
	}

	startUserVsUser() {
		const player1 = new Player('Guest 1');
		const player2 = new Player('Guest 2');
		this.match = new Match(this, [player1, player2]);
		this.match.play();
	}

	createTournament() {
		const tournament = new Tournament(this);
		this.tournament = tournament;
	}

	// Not sure what this function is for.
	endGame() {
		const redirecturi = "/#home";
		window.location.href = redirecturi;
	}

	onWindowResize() {
		this.renderer.setSize( window.innerWidth, window.innerHeight );
	}
}

export { Game };
