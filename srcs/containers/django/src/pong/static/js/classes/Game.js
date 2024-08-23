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
		this.audio = null;

		// Game state
		this.scoreToWin = 3;
		this.running = false;
		this.match = null;
		this.tournament = null;
		this.readyForNextMatch = false;
		this.isOptionMenuVisible = false;
		this.mode = 'none';
		this.loggedUser = 'Guest';

		this.socket = null;
		this.socket_data = null;

		// this.socket = new WebSocket('wss://' + window.location.host + '/ws/pong/');

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
	async startSolo() {
		this.mode = 'solo';
		console.log('mode:', this.mode);
		this.audio.playSound(this.audio.select_2);
		const player1 = new Player(this.loggedUser);
		const player2 = new Player('pongAI');
		player2.setAI(this);
		this.match = new Match(this, [player1, player2]);
		this.match.play();
	}

	startUserVsUser() {
		this.mode = 'UvU';
		console.log('mode:', this.mode);
		this.audio.playSound(this.audio.select_2);
		const player1 = new Player(this.loggedUser);
		const player2 = new Player('Guest 2');
		this.match = new Match(this, [player1, player2]);
		this.match.play();
	}

	initSocket(player1) {
        if (this.socket) {
            this.socket.close();
        }

        this.socket = new WebSocket('wss://' + window.location.host + '/ws/pong/');

        this.socket.onopen = () => {
            console.log('WebSocket connection opened for player:', player1.name);
				this.socket.send(JSON.stringify({
					'type': 'connected',
					'player': player1.name,
				}));
        };

        this.socket.onclose = (event) => {
            console.log('WebSocket closed', event);
            // this.handleReconnection();
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error', error);
        };

        this.socket.onmessage = (e) => {
			this.socket_data = JSON.parse(e.data);
			console.log('Received message:', this.socket_data);
			let data = this.socket_data;

			if (data.type === 'player_role') {
				player1.online_role = data.player_role;
				console.log('local role assigned to ' + data.player_role);
			}
			if (data.type === 'player_connected') {		
				if (data.player_role !== player1.online_role) {
					player1.oponent = new Player(this.socket_data.player);
					console.log('Player connected:', data.player);
				}
			}
			if (data.type === 'game_state' && this.running === true) {
				const player1 = this.match.players[0];
				const myRole = player1.online_role;
				// Update the other player's paddle position only
				if (myRole === 'A' && data.paddle_B !== undefined) {
					this.paddle2.position.z = data.paddle_B;
					this.paddle2.position.z *= -1;
				} else if (myRole === 'B' && data.ball_x !== undefined && data.ball_z !== undefined && data.paddle_A !== undefined) {
					this.paddle2.position.z = data.paddle_A;
					this.ball.position.x = data.ball_x;
					this.ball.position.z = data.ball_z;
					this.paddle2.position.z *= -1;
					this.ball.position.x *= -1;
					this.ball.position.z *= -1;
				}		
        	}
    }}

	handleReconnection() {
        setTimeout(() => {
            console.log('Reconnecting...');
            this.initSocket();
        }, this.reconnectInterval);
    }

	async startVsOnline() {
		this.mode = 'vsOnline';
		console.log('mode:', this.mode);
		this.audio.playSound(this.audio.select_2);
		const player1 = new Player(this.loggedUser);
		var player2 = null;
		this.initSocket(player1);
	
		// Create a promise to handle player2 connection
		const player2Promise = new Promise((resolve) => {
			const checkPlayer2 = () => {
				if (player1.oponent) {
					player2 = player1.oponent;
					resolve();
					}
			};
			checkPlayer2();
			const interval = setInterval(() => {
				checkPlayer2();
			}, 10);
	
		});

		await player2Promise;
		this.match = new Match(this, [player1, player2]);
		console.log('Starting the match...');
		this.match.play(this);
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

	viewOptionMenu() {
		console.log('viewOptionMenu');
		console.log(this.isOptionMenuVisible);
		if (this.isOptionMenuVisible === false) {
			console.log('displaying option menu');
			displayDiv('js-tournament_score-btn');
			displayDiv('js-audio-btn');
			if (this.loggedUser === 'Guest') {
				displayDiv('js-login-btn');
			}
			else {
				displayDiv('js-logout-btn');
			}
			displayDiv('js-end-game-btn');
			textToDiv('-', 'js-option-btn');
			this.isOptionMenuVisible = true;
		}
		else {
			console.log('hiding option menu');
			notDisplayDiv('js-tournament_score-btn');
			notDisplayDiv('js-audio-btn');
			notDisplayDiv('js-login-btn');
			notDisplayDiv('js-logout-btn');
			notDisplayDiv('js-end-game-btn');
			textToDiv('=', 'js-option-btn');
			this.isOptionMenuVisible = false;
		}
	}
	
	muteAudio() {
		if (this.audio.mute === false) {
			this.audio.muteSounds();
			textToDiv('Audio off', 'js-audio-btn');
		}
		else {
			this.audio.unmuteSounds();
			textToDiv('Audio on', 'js-audio-btn');
		}
	}

	executeBlockchain() {
		this.audio.playSound(this.audio.select_1);
		new Blockchain(this.tournament.tournamentId);
	}
}

export { Game };
