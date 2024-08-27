import * as THREE from '../three-lib/three.module.js';
import { Settings } from './Settings.js';
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
import { delay, displayDiv, notDisplayDiv, textToDiv, getCookie } from '../utils.js';
import { Stats } from './Stats.js';
import { Profile } from './Profile.js';

class Game {
	constructor() {
        // Settings
        this.settings = new Settings(this);
        
		// Game state
		// this.running = false;
		// this.match = null;
		// this.tournament = null;
		// this.readyForNextMatch = false;
		// this.isOptionMenuVisible = false;
		// this.isSettingsMenuVisible = false;
		// this.mode = 'none';
		// this.loggedUser = 'Guest';
		// this.socket = null;
		// this.socket_data = null;
        
		// Scene
		const container = document.getElementById('threejs-container');
		this.scene = new THREE.Scene();
		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.cam1 = new Camera(this);
		this.cam2 = new Camera(this);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setClearColor(0xc1d1db);
		container.appendChild(this.renderer.domElement);
        
		// Objects
		this.field = new Field(this.scene, this.settings.fieldLength, this.settings.fieldWidth);
		this.paddle1 = new Paddle(this, true);
		this.paddle2 = new Paddle(this, false);
		this.ball = new Ball(this);
		this.environment = new Environment(this.scene);
		this.audio = null;
        
		// Game state
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

		// this.socket = new WebSocket('wss://' + window.location.host + '/ws/pong/');

		console.log('Game class created');
		this.boundCreateAudioContext = this.createAudioContext.bind(this);
		document.addEventListener('click', this.boundCreateAudioContext);

		// Statistics and user profile

		this.stats = new Stats(this);
		this.userProfile = new Profile(this);
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

	// async addPlayer() {
	// 	this.game.audio.playSound(this.game.audio.select_1);
	// 	const playerName = document.getElementById('playerNameInput').value.trim();
	// 	console.log(playerName);
	// 	if (playerName === '') {
	// 		displayDiv('error');
	// 		return;
	// 	}
	// 	else {
	// 		notDisplayDiv('error');
	// 	}
	// 	const newPlayer = new Player(playerName);
	// 	this.players.push(newPlayer);
	// 	this.displayPlayers();
	// 	document.getElementById('playerNameInput').value = '';
	// }

	startUserVsUser() {
		this.mode = 'UvU';
		this.audio.playSound(this.audio.select_2);
		console.log('Starting User vs User');
		// if (this.loggedUser !== 'Guest')
		// 	document.getElementById('js-player1-entry').innerText = this.loggedUser;
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

		this.socket.onmessage = async (e) => {
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
			if (data.type === 'connection_over') {		
				console.log('Received message:', this.socket_data);
				if (this.running) {
					this.running = false;
					console.log('Connection lost after player disconnected');
					if (this.socket)
						this.socket.close();
					this.userProfile.showNotification('Connection lost after player disconnected');
					setTimeout(() => {
						window.loadPage('game_mode');
					}, 2500);
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
		console.log('Connection is over');
	}

	async startVsOnline() {
		this.mode = 'vsOnline';
		this.audio.playSound(this.audio.select_2);
    
        // set settings to default
        this.settings.reset();
    
		const player1 = new Player(this.loggedUser);
		let player2 = null;
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
		tournament.initializeTournament();
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
			displayDiv('js-end-game-btn');
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
			displayDiv('match-history-btn');
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

    // update scene for when settings have changed
    updateScene(length, width) {
        this.field.remove();
        this.paddle1.remove();
        this.paddle2.remove();
        this.ball.remove();
		this.field = new Field(this.scene, length, width);
		this.paddle1 = new Paddle(this, true);
		this.paddle2 = new Paddle(this, false);
        if (this.match && this.match.players[1].ai) {
            this.scene.remove(this.match.players[1].ai.mesh);
        }
        this.ball = new Ball(this);
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

	executeBlockchain(tournamentId) {
		this.audio.playSound(this.audio.select_1);
		new Blockchain(tournamentId);
	}
	
	// register in database {

	registerInDatabase() {
		console.log('registerInDatabase');
		this.createMatch();
	}

	async createPlayer(playerName) {
		console.log('Create player in database:', playerName);
	
		try {
			const response = await fetch('/api/create_player/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json; charset=utf-8',
					'X-CSRFToken': getCookie('csrftoken'),
				},
				body: JSON.stringify({
					'player_name': playerName,
				}),
			});
	
			if (!response.ok) {
				throw new Error(`Error creating player: ${response.statusText}`);
			}
	
			const data = await response.json();
			console.log('Player added:', data);
		} catch (error) {
			console.error('Error adding player:', error);
		}
	}

	async createMatch() {
		console.log('Creating Match...');
	
		try {
			const response = await fetch('/api/create_match/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json; charset=utf-8',
					'X-CSRFToken': getCookie('csrftoken'),
				},
				body: JSON.stringify({
					'player1': this.match.players[0].name,
					'player2': this.match.players[1].name,
					'player1_score': this.match.score.result[0],
					'player2_score': this.match.score.result[1],
					'timestamp': this.match.timestamp,
					'mode': this.mode,
				}),
			});
	
			if (!response.ok) {
				throw new Error(`Error creating match: ${response.statusText}`);
			}
	
			const data = await response.json();
			console.log('Match created successfully:', data);
		} catch (error) {
			console.error('Error creating match:', error);
		}
	}
}

export { Game };
