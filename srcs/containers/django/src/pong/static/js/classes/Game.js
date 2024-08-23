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
import { Blockchain } from './Blockchain.js';
import { delay, displayDiv, notDisplayDiv, textToDiv } from '../utils.js';

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
		// this.controls = new OrbitControls(this.cam1.camera, container);
		this.audio = null;

		// Game state
		this.scoreToWin = 3;
		this.running = false;
		this.match = null;
		this.tournament = null;
		this.readyForNextMatch = false;
		this.mode = 'none';
		this.loggedUser = 'Guest';

		console.log('Game class created');
		this.boundCreateAudioContext = this.createAudioContext.bind(this);
		document.addEventListener('click', this.boundCreateAudioContext);
	}
	
	// Create audio audio context once there is a first interaction with the website to comply with internet rules
	async createAudioContext() {
		const audio = document.createElement("audio");
		audio.setAttribute("x-webkit-airplay", "deny");
		audio.preload = "auto";
		audio.loop = true;
		audio.src = './static/audio/silence.mp3'; //fix the ios audio not playing when the phone or ipad is switch to sielnt mode.
		audio.play();
		this.audio = new Audio(this.cam1);
		document.removeEventListener('click', this.boundCreateAudioContext);
		await delay(600); // crappy way to wait for the audio engigne to be fully loaded.
		this.audio.playSound(this.audio.woosh_1);
		this.cam1.introCameraAnimation();
		setTimeout(() => this.audio.playSound(this.audio.woosh_2),1500);
		setTimeout(() => this.audio.playSound(this.audio.chimes),3400);
		setTimeout(() => this.audio.playSound(this.audio.main),4800);
		this.ball.addAudio(this.audio);
	}

	// These are the modes bound to the buttons in the menu
	startSolo() {
		this.mode = 'solo';
		this.audio.playSound(this.audio.select_2);
		const player1 = new Player(this.loggedUser);
		const player2 = new Player('pongAI');
		player2.setAI(this);
		this.match = new Match(this, [player1, player2]);
		this.match.play();
	}

	startUserVsUser() {
		this.mode = 'UvU';
		this.audio.playSound(this.audio.select_2);
		const player1 = new Player(this.loggedUser);
		const player2 = new Player('Guest 2');
		this.match = new Match(this, [player1, player2]);
		this.match.play();
	}

	createTournament() {
		this.mode = 'tournament';
		const tournament = new Tournament(this);
		this.tournament = tournament;
	}

	endGame() {
		this.running = false;
		this.ball.resetBall();
		loadPage('game_mode');
	}

	replayGame() {
		switch (this.mode) {
			case 'solo':
				this.startSolo();
				break;
			case 'UvU':
				this.startUserVsUser();
				break;
			case 'tournament':
				this.tournament();
				break;
		}
	}

	onWindowResize() {
		this.renderer.setSize( window.innerWidth, window.innerHeight );
	}

	showOptionMenu() {
		displayDiv('js-tournament_score-btn');
		displayDiv('js-audio-btn');
		if (this.loggedUser === 'Guest') {
			displayDiv('js-login-btn');
		}
		else {
			displayDiv('js-logout-btn');
			displayDiv('profile-changer');
		}
		displayDiv('js-end-game-btn');
		textToDiv('-', 'js-option-btn');

		let optionBtn = document.getElementById('js-option-btn');
		optionBtn.removeEventListener('click', this.showOptionMenu.bind(this));
		optionBtn.addEventListener('click', this.hideOptionMenu.bind(this));
	}

	hideOptionMenu() {
		notDisplayDiv('js-tournament_score-btn');
		notDisplayDiv('js-audio-btn');
		notDisplayDiv('js-login-btn');
		notDisplayDiv('js-logout-btn');
		notDisplayDiv('js-end-game-btn');
		textToDiv('=', 'js-option-btn');

		let optionBtn = document.getElementById('js-option-btn');
		optionBtn.removeEventListener('click', this.hideOptionMenu.bind(this));
		optionBtn.addEventListener('click', this.showOptionMenu.bind(this));
	}

	muteAudio() {
		this.audio.muteSounds();
		textToDiv('Audio off', 'js-audio-btn');
		let audioBtn = document.getElementById('js-audio-btn');
		audioBtn.removeEventListener('click', this.muteAudio.bind(this));
		audioBtn.addEventListener('click', this.unmuteAudio.bind(this));
	}

	unmuteAudio() {
		this.audio.unmuteSounds();
		textToDiv('Audio on', 'js-audio-btn');
		let audioBtn = document.getElementById('js-audio-btn');
		audioBtn.removeEventListener('click', this.unmuteAudio.bind(this));
		audioBtn.addEventListener('click', this.muteAudio.bind(this));
	}

	executeBlockchain() {
		this.audio.playSound(this.audio.select_1);
		new Blockchain(this.tournament.tournamentId);
	}
}

export { Game };
