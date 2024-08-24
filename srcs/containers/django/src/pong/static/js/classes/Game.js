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
import { Blockchain } from './Blockchain.js';
import { delay, displayDiv, notDisplayDiv, textToDiv } from '../utils.js';

class Game {
	constructor() {
		// Game state
		this.scoreToWin = 6;
		this.aiLevel = 2;
		this.running = false;
		this.match = null;
		this.tournament = null;
		this.readyForNextMatch = false;
		this.isOptionMenuVisible = false;
		this.isSettingsMenuVisible = false;
		this.mode = 'none';
		this.loggedUser = 'Guest';

		this.socket = null;
		this.socket_data = null;

        // Default Settings
        this.ballSpeed = 0.2;
        this.paddleSpeed = 0.15;
        this.fieldWidth = 12;
        this.fieldLength = 16;
        this.aiLevel = 2;

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
		this.field = new Field(this.scene, 16, 12);
		this.paddle1 = new Paddle(this.scene, this.field, true);
		this.paddle2 = new Paddle(this.scene, this.field, false);
		this.ball = new Ball(this);
		this.environment = new Environment(this.scene);
		this.audio = null;

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
		this.audio.playSound(this.audio.select_2);
		const player1 = new Player(this.loggedUser);
		const player2 = new Player('pongAI');
		player2.setAI(this);
		this.match = new Match(this, [player1, player2]);
		this.match.play(this);
	}

	startUserVsUser() {
		this.mode = 'UvU';
		this.audio.playSound(this.audio.select_2);
		const player1 = new Player(this.loggedUser);
		const player2 = new Player('Guest 2');
		this.match = new Match(this, [player1, player2]);
		this.match.play(this);
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
			this.handleDisconnection();
		};

		this.socket.onerror = (error) => {
			console.error('WebSocket error', error);
		};

		this.socket.onmessage = (e) => {
			this.socket_data = JSON.parse(e.data);
			let data = this.socket_data;
			
			if (data.type === 'player_role') {
				player1.online_role = data.player_role;
				console.log('local role assigned to ' + data.player_role);
			}
			if (data.type === 'new_score') {
				const player1 = this.match.players[0];
				const myRole = player1.online_role;
				if (myRole === 'B') {
					console.log('Received message:', data.score_A, '  ', data.score_B);
					this.match.score.result = [data.score_B, data.score_A];
					this.match.score.onlineUpdate = true;
					textToDiv(this.match.score.result[0], `player${1}-score`);
					textToDiv(this.match.score.result[1], `player${2}-score`);
				}
			}
			if (data.type === 'player_connected') {		
				console.log('Received message:', this.socket_data);
				if (data.player_role !== player1.online_role) {
					player1.oponent = new Player(this.socket_data.player);
					console.log('Player connected:', data.player);
				}
			}
			if (data.type === 'game_state' && this.running) {
				const player1 = this.match.players[0];
				const myRole = player1.online_role;
			
				if (myRole === 'A' && data.paddle_B !== undefined) {
					this.paddle2.position.z = -data.paddle_B;
				} else if (myRole === 'B' && data.ball_x !== undefined && data.ball_z !== undefined && data.paddle_A !== undefined) {
					this.paddle2.position.z = -data.paddle_A;
					this.ball.position.x = -data.ball_x;
					this.ball.position.z = -data.ball_z;
				}
			}
	}}

	handleDisconnection() {
		console.log('!!! Connection lost !!!');
	}

	async startVsOnline() {
		this.mode = 'vsOnline';
		this.audio.playSound(this.audio.select_2);
    
        // set settings to default
        this.setSettingsToDefault();
    
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
			if (this.running)
				displayDiv('js-end-game-btn');
            else {
                displayDiv('js-settings-btn');
            }
			textToDiv('-', 'js-option-btn');
			this.isOptionMenuVisible = true;
		}
		else {
			console.log('hiding option menu');
			notDisplayDiv('js-tournament_score-btn');
			notDisplayDiv('js-audio-btn');
			notDisplayDiv('js-login-btn');
			notDisplayDiv('js-logout-btn');
			notDisplayDiv('js-settings-btn');
			notDisplayDiv('js-end-game-btn');
			textToDiv('=', 'js-option-btn');
			this.isOptionMenuVisible = false;
		}
	}

	hideOptionMenu() {
		console.log('hiding option menu');
		notDisplayDiv('js-tournament_score-btn');
		notDisplayDiv('js-audio-btn');
		notDisplayDiv('js-login-btn');
		notDisplayDiv('js-logout-btn');
		notDisplayDiv('js-settings-btn');
		notDisplayDiv('js-end-game-btn');
		textToDiv('=', 'js-option-btn');
		this.isOptionMenuVisible = false;
	}

	// Settings menu

	// Functions to reset settings to default values
    setSettingsToDefault() {
        this.updateField(fieldLength, fieldWidth);
        this.game.ball.initialSpeed = this.ballSpeed;
        this.game.paddle1.speed = this.paddleSpeed;
        this.game.paddle2.speed = this.paddleSpeed;
        const fieldWidth = this.fieldWidth;
        const fieldLength = this.fieldLength;
        this.game.aiLevel = this.aiLevel;
    }

	setSettingsMenuToDefault() {
		document.getElementById('ballSpeed').value = this.ballSpeed * 20;
		document.getElementById('paddleSpeed').value = this.paddleSpeed * 20;
		document.getElementById('fieldWidth').value = this.fieldWidth;
		document.getElementById('fieldLength').value = this.fieldLength;
		document.getElementById('aiLevel').value = this.aiLevel == 1 ? 'easy' : this.aiLevel == 2 ? 'medium' : 'hard'; 
	}

	setSettingsMenuToCurrent() {
		document.getElementById('ballSpeed').value = this.ball.initialSpeed * 20;
		document.getElementById('paddleSpeed').value = this.paddle1.speed * 20;
		document.getElementById('fieldWidth').value = this.field.geometry.parameters.depth;
		document.getElementById('fieldLength').value = this.field.geometry.parameters.width;
		document.getElementById('aiLevel').value = this.aiLevel == 1 ? 'easy' : this.aiLevel == 2 ? 'medium' : 'hard'; 
	}

	saveSettings() {
		const ballSpeed = document.getElementById('ballSpeed').value;
		const paddleSpeed = document.getElementById('paddleSpeed').value;
		const fieldWidth = document.getElementById('fieldWidth').value;
		const fieldLength = document.getElementById('fieldLength').value;
		const aiLevel = document.getElementById('aiLevel').value;

		this.updateField(fieldLength, fieldWidth);
		this.ball.initialSpeed = ballSpeed / 20;
		this.paddle1.speed = paddleSpeed / 20;
		this.paddle2.speed = paddleSpeed / 20;
		this.aiLevel = aiLevel === 'easy' ? 1 : aiLevel === 'medium' ? 2 : 3;

		console.log(`Ball Speed: ${ballSpeed}`, this.ball.initialSpeed);
		console.log(`Paddle Speed: ${paddleSpeed}`, this.paddle1.speed);
		console.log(`Field Width: ${fieldWidth}`, this.field.geometry.parameters.width);
		console.log(`Field Length: ${fieldLength}`, this.field.geometry.parameters.depth);
		console.log(`AI Level: ${aiLevel}`, this.aiLevel);

		// updateBallSpeed(ballSpeed);
		// updatePaddleSpeed(paddleSpeed);
		// updateFieldDimensions(fieldWidth, fieldHeight);
		// updateAILevel(aiLevel);
	
		loadPage('game_mode');
	}

    updateField(length, width) {
		this.scene.remove(this.field.mesh);
		this.scene.remove(this.field.net);
		this.scene.remove(this.paddle1.mesh);
		this.scene.remove(this.paddle2.mesh);
		this.field = new Field(this.scene, length, width);
		this.paddle1 = new Paddle(this.scene, this.field, true);
		this.paddle2 = new Paddle(this.scene, this.field, false);
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
