import * as THREE from '../three-lib/three.module.js';
import { Ball } from './Ball.js';
import { Field } from './Field.js';
import { Paddle } from './Paddle.js';
import { AI } from './AI.js';
import { Camera } from './Camera.js';
import { Audio } from './Audio.js';
import { Environment } from './Environment.js';
import { OrbitControls } from '../three-lib/OrbitControls.js';
import { gameState } from '../game-state.js';
import { getRandomInt, textToDiv, HTMLToDiv, countdown, waitForEnter } from '../utils.js';

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
		console.log('Game object created, player names: ', this.playerNames);
		this.mode = '';
	}

 	async startGame(mode) {
		try {
			await window.loadPage('pong');
			this.playerNames.push('Guest', 'pongAI');
			this.mode = mode;
			this.gameMain();
		} catch (error) {
			console.error('Error starting game:', error);
		}
	}

	async gameMain() {
		const ball = this.ball;
		const mode = this.mode;
		const player1Name = this.playerNames[0];
		const player2Name = this.playerNames[1];

		console.log(`Starting game: ${player1Name} vs ${player2Name}`);
		HTMLToDiv(`${player1Name}<br>VS<br>${player2Name}`, 'announcement');
		gameState.playerScores = [0, 0];
		gameState.running = true;
		gameState.mode = mode;

		const enter = document.getElementById('enter');
		enter.style.display = 'block';
		await waitForEnter(enter);
		await countdown(1, announcement);
		// await countdown(3, announcement);
		const menu = document.getElementById('menu');
		menu.classList.add('fade-out');
		setTimeout(function() {
			menu.classList.add('hidden');
		}, 1500); 
		
		ball.serve = getRandomInt(0, 2) ? 1 : -1;
		ball.serveBall();
		textToDiv('0', 'player1-score');
		textToDiv(player1Name, 'player1-name');
		textToDiv('0', 'player2-score');
		textToDiv(player2Name, 'player2-name');
		console.log(`Game starting in mode: ${mode}`);
	}

/* 	pauseGame() {}
	endGame() {}
	startRound() {}
	endRound() {}
 */
	onWindowResize() {
		this.renderer.setSize( window.innerWidth, window.innerHeight );
	}
}

export { Game };