import * as THREE from '../three-lib/three.module.js';
import { Ball } from './Ball.js';
import { Field } from './Field.js';
import { Paddle } from './Paddle.js';
import { AI } from './AI.js';
import { Camera } from './Camera.js';
import { Audio } from './Audio.js';
import { Environment } from './Environment.js';
import { OrbitControls } from '../three-lib/OrbitControls.js';
import { getRandomInt, textToDiv, HTMLToDiv, countdown, waitForEnter, displayWinMessage } from '../utils.js';

class Game {
	constructor(container) {
		// maybe should be its own scene class
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

		// Game State
		this.player1 = '';
		this.player2 = '';
		this.players = [];
		this.mode = '';
		this.playerScores = [0, 0];
		this.scoreToWin = 3; // should be in settings
		this.running = false;
		this.matchResult = [];
	}

	async startMatch(mode) {
		try {
			await window.loadPage('pong');
			this.mode = mode;
			console.log('Starting game in mode:', mode);
			this.setplayers(mode);
			this.gameMain();
		} catch (error) {
			console.error('Error starting game:', error);
		}
	}

	setplayers(mode) {
		if (mode === 'user-vs-user') {
			this.players.push('Guest 1', 'Guest 2');
		} else if (mode == 'user-vs-computer') {
			this.players.push('Guest', 'pongAI');
		}
	}

	async gameMain() {
		const ball = this.ball;
		const mode = this.mode;
		let player1Name;
		let player2Name;
		if (mode !== 'tournament') {
			player1Name = this.players[0];
			player2Name = this.players[1];
		} else {
			player1Name = this.player1;
			player2Name = this.player2;
		}
		console.log(`Starting game: ${player1Name} vs ${player2Name}`);
		HTMLToDiv(`${player1Name}<br>VS<br>${player2Name}`, 'announcement');
		this.playerScores = [0, 0];
		this.running = true;
		this.mode = mode;

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

	update(keys) {
		const field = this.field;
		const paddle1 = this.paddle1;
		const paddle2 = this.paddle2;
		const ball = this.ball;
		const cam1 = this.cam1;
		const cam2 = this.cam2;
	
		// move left paddle
		let direction = keys['a'] ? -1 : keys['d'] ? 1 : 0;
		paddle1.movePaddle(direction, field);
	
		// move right paddle
		direction = this.mode === 'user-vs-computer' ? this.ai.movePaddle(paddle2, ball) :
			keys['ArrowRight'] ? -1 :
			keys['ArrowLeft'] ? 1 :
			0;
		paddle2.movePaddle(direction, field);
	
		// move and bounce ball
		ball.animateBall();
		ball.tryPaddleCollision(paddle1, paddle2, this.audio);
		ball.tryCourtCollision(field);
	
		var split = document.getElementById('vertical-line');
		if (this.running === false) {
			cam1.renderMenuView(this);
			split.style.display = 'none';
		} else {
			this.updateScore();
			if (this.mode === 'user-vs-computer') {
				cam1.renderSingleView(this);
			}
			if (this.mode === 'user-vs-user' || this.mode === 'tournament') {
				cam1.renderSplitView(this, 0);
				cam2.renderSplitView(this, 1);
				split.style.display = 'block';
			}
		}
	}

	isScore() {
		const ball = this.ball;
		const field = this.field;
		const halfFieldWidth = field.geometry.parameters.width / 2;
		const ballRightSide = this.ball.position.x + ball.radius;
		const ballLeftSide = ball.position.x - ball.radius;

		return ballRightSide < -halfFieldWidth ? 1 :
			ballLeftSide > halfFieldWidth ? 0 :
			-1;
	}

	async updateScore() {
		const ball = this.ball;
		const player = this.isScore();
		if (player === -1) return;

		this.playerScores[player] += 1;
		textToDiv(this.playerScores[player], `player${player + 1}-score`);
		ball.serveBall();

		const winner = this.isWinner();
		if (winner === -1) return;

		this.running = false;
		ball.resetBall();
		await displayWinMessage(`Player ${winner + 1} wins!`);
		if (this.mode != 'tournament') {
			this.endGame();
			return ;
		}


	}

	endGame() {
		var redirecturi = "/#home";
		window.location.href = redirecturi;
	}

	stopGame() {
		this.running = false;
	}

	isWinner() {
		return this.playerScores[0] === this.scoreToWin ? 0:
			this.playerScores[1] === this.scoreToWin ? 1:
			-1;
	}
	
/* 	pauseGame() {}
	startRound() {}
	endRound() {}
 */
	onWindowResize() {
		this.renderer.setSize( window.innerWidth, window.innerHeight );
	}
}

export { Game };
