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
		this.scoreToWin = 6;
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

	initSocket(player1) {
        if (this.socket) {
            this.socket.close(); // Close existing connection if it exists
        }

        this.socket = new WebSocket('wss://' + window.location.host + '/ws/pong/');

        this.socket.onopen = () => {
            console.log('WebSocket connection opened');
				this.socket.send(JSON.stringify({
					'type': 'connected',
					'player': player1.name,
				}));
        };

        this.socket.onclose = (event) => {
            console.log('WebSocket closed', event);
            this.handleReconnection();
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error', error);
        };

        this.socket.onmessage = (e) => {
			this.socket_data = JSON.parse(e.data);
			console.log('Received message:', this.socket_data);
        };
    }

	handleReconnection() {
        // Attempt to reconnect
        setTimeout(() => {
            console.log('Reconnecting...');
            this.initSocket();
        }, this.reconnectInterval);
    }

	async startVsOnline() {
		this.mode = 'vsOnline';
		this.audio.playSound(this.audio.select_2);
		const player1 = new Player(this.loggedUser);
		this.initSocket(player1);
	
		const socket = this.socket;
	
		// Create a promise to handle player2 connection
		const player2Promise = new Promise((resolve, reject) => {
			const checkPlayer2 = () => {
				if (this.socket_data && this.socket_data.type === 'player_connected') {
					if (this.socket_data.player === this.loggedUser) {
						player1.online_role = this.socket_data.player_role;
						console.log('local role assigned to ' + this.socket_data.player_role);
					} else if (this.socket_data.player !== this.loggedUser) {
						const player2 = new Player(this.socket_data.player);
						console.log('player 2 created');
						resolve({ player1, player2 });
					}
				}
			};
	
			// Check for player2 connection initially and periodically
			checkPlayer2();
			const interval = setInterval(() => {
				checkPlayer2();
			}, 100); // Check every 100ms
	
			// WebSocket error handler
			socket.onerror = (error) => {
				clearInterval(interval);
				reject(new Error('WebSocket error: ' + error.message));
			};
	
			// WebSocket close handler
			socket.onclose = () => {
				clearInterval(interval);
				reject(new Error('WebSocket connection closed before player2 connected'));
			};
		});
	
		try {
			// Wait for both players to be ready
			const { player1, player2 } = await player2Promise;
	
			// Add a more stable way to make sure the game starts with the right amount of players
			this.match = new Match(this, [player1, player2]);
			this.match.play(this);
		} catch (error) {
			// Handle errors (e.g., WebSocket errors or player2 not connected)
			console.error('Error starting the match:', error);
		}
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
