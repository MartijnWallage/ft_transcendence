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

class Game {
	constructor() {
		// Scene
		const container = document.getElementById('threejs-container');
		this.scene = new THREE.Scene();
		this.renderer = new THREE.WebGLRenderer({container}, { antialias: true });
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
		this.audio = new Audio(this.cam1);

		// Game state
		this.scoreToWin = 1;
		this.running = false;
		this.match = null;
		this.tournament = null;

		// WebSocket
		// this.players = [];
		// this.playerCount = 0;
		// this.currentPlayerIndex = 0;
		// this.initializedPlayers = 0;
		// this.websocket = null; // Single WebSocket instance
        // this.matchStarted = false;
		this.players = []; // Array to hold player objects
        this.readyPlayers = new Set(); // To track which players are ready
        this.websocketConnections = {}; // To store WebSocket connections for each player
        this.currentPlayerName = ''; // To track the current player
		this.playerRoles = {}; // To store roles of players
		 // Bind the function to ensure correct context
		this.startRemoteUserVsUser = this.startRemoteUserVsUser.bind(this);
		// Attach the function to the button
        // document.getElementById('js-start-user-vs-user-remote-btn').onclick = this.startRemoteUserVsUser;
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

	async playerReady(name) {
        // this.currentPlayerName = name; // Track the current player's name
		this.currentPlayerName = name + Object.keys(this.websocketConnections).length; // Ensure unique name
        const websocket = new WebSocket('wss://10.15.109.3:8443/ws/pingpongsocket/');

        websocket.onopen = () => {
            console.log(`WebSocket connection established for ${this.currentPlayerName}`);
            this.websocketConnections[this.currentPlayerName] = websocket;
            
            websocket.send(JSON.stringify({ type: 'player_action', data: { action: 'ready' } }));
        };

        websocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('Received data:', data); // Add this line to see the structure of the incoming data

			if (data.type === 'players_ready') {
                this.playerRoles = data.players.reduce((roles, player, index) => {
                    console.log(`Processing player ${index}:`, player); // Debugging line
					roles[`Guest ${index + 1}`] = player.name;
                    return roles;
                }, {});
                
                // Update UI with player roles
				const player1Status = document.getElementById('player1-status');
				const player2Status = document.getElementById('player2-status');
				
				player1Status.innerText = `Player 1 : ${this.playerRoles['Guest 1'] || 'looking for match ......'}`;
				player2Status.innerText = `Player 2 : ${this.playerRoles['Guest 2'] || 'looking for match ......'}`;
            
                // Check if both players are ready
                if (Object.keys(this.playerRoles).length === 2) {
                    document.getElementById('js-player-ready-btn').style.display = 'none'; // Hide the 'Ready' button
					document.getElementById('js-start-user-vs-user-remote-btn').style.display = 'block'; // Show the 'Continue' button
                }
            } else if (data.type === 'start_game') {
				this.initializeGame();
			} else if (data.type === 'player_action') {
				console.log(`Player ${data.player} action:`, data.data);
				// Handle other player actions here
			}
        };

        websocket.onclose = (event) => console.log(`WebSocket connection closed for ${this.currentPlayerName}`);
        websocket.onerror = (error) => console.error(`WebSocket error for ${this.currentPlayerName}:`, error);
    }


	startRemoteUserVsUser() {
        if (Object.keys(this.playerRoles).length < 2) {
            console.error('Cannot start game. Not all players are ready.');
            return;
        }

		// Notify the other player to start the game
		const message = JSON.stringify({ type: 'start_game' });
		Object.values(this.websocketConnections).forEach(ws => ws.send(message));

        this.initializeGame();
    }

	initializeGame() {
		const player1 = new Player('Guest 1', this.websocketConnections['Guest 1']);
		const player2 = new Player('Guest 2', this.websocketConnections['Guest 2']);
		
		this.match = new Match(this, [player1, player2]);
		console.log('Match object created:', this.match); // Debugging line
		this.running = true;  // Ensure the game is marked as running
		this.match.play();
	}


	startMatch() {
        if (this.players.length === this.playerCount) {
            this.match = new Match(this, this.players);
            this.match.play();
        }
    }
	
	updateGameState(gameState) {
        // Use status method to update game state
        if (this.match) {
            this.match.status(gameState);
        }
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
