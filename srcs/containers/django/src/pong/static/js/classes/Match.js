import { getRandomInt, textToDiv, HTMLToDiv, countdown, waitForEnter, displayDiv } from '../utils.js';
import { Score } from './Score.js';

class Match {
		constructor(game, players) {
		this.game = game;
		this.players = players;
		this.running = false;
		this.score = new Score(game, players);
		this.timestamp = null;
		this.timeToSend = true;
		this.frameCount = 0;
		game.readyForNextMatch = false;

		// Initialize WebSocket connection
		this.socket = game.socket;
		
		//key listener
		this.keys = {};
		document.addEventListener("keydown", (event) => { 
			this.keys[event.key] = true; 
		});
		
		document.addEventListener("keyup", (event) => {
			this.keys[event.key] = false;
		});

		//touch listener
		document.addEventListener("touchstart", (event) => {
			let touchX = event.touches[0].clientX;
			let middle = window.innerWidth / 2;
		
			if (touchX < middle) {
				this.keys['a'] = true;
				this.keys['d'] = false;
			} else {
				this.keys['a'] = false;
				this.keys['d'] = true;
			}
		});
		
		document.addEventListener("touchend", (event) => {
			// Reset the direction when touch ends
			this.keys['a'] = false;
			this.keys['d'] = false;
		});
		console.log('Match instance created');
	}

	async play(game) {
		const player1Name = this.players[0].name;
		const player2Name = this.players[1].name;

		await window.loadPage('pong');
		
		displayDiv('menu');
		console.log('Match started');
		
		const ball = this.game.ball;
		HTMLToDiv(`${player1Name}`, 'announcement-l1');
		HTMLToDiv(`VS`, 'announcement-mid');
		HTMLToDiv(`${player2Name}`, 'announcement-l2');
		textToDiv('0', 'player1-score');
		textToDiv(player1Name, 'player1-name');
		textToDiv('0', 'player2-score');
		textToDiv(player2Name, 'player2-name');

		await waitForEnter(game);
		this.game.running = true;
		displayDiv('game-scores');

		await countdown(3, this.game.audio);
		setTimeout(() => {
			const menu = document.getElementById('menu');
			menu.classList.add('fade-out');
			setTimeout(() => {
				menu.classList.add('hidden');
			}, 1000);
		}, 100);
		this.timestamp = Date.now();
		ball.serve = getRandomInt(0, 2) ? 1 : -1;
		ball.serveBall();
	}

	update(game) {
		const field = game.field;
		const paddle1 = game.paddle1;
		const paddle2 = game.paddle2;
		const ball = game.ball;
		const cam1 = game.cam1;
		const cam2 = game.cam2;
		const socket = game.socket;

		if (game.mode === 'vsOnline') {
			this.timeToSend = !this.timeToSend;
			if (this.timeToSend) {
				this.sendGameState(socket);
			}
		}

		// move left paddle
		let direction = this.keys['a'] ? -1 : this.keys['d'] ? 1 : 0;
		paddle1.movePaddle(direction);
		
		// move right paddle
		if (game.mode !==  'vsOnline') {
			direction = this.players[1].ai ? this.players[1].ai.movePaddle(paddle2) :
				this.keys['ArrowRight'] ? -1 :
				this.keys['ArrowLeft'] ? 1 :
				0;
				paddle2.movePaddle(direction);
		}
		// move and bounce ball
		ball.animateBall();
		ball.tryPaddleCollision(paddle1, paddle2);
		ball.tryCourtCollision(field);
		
		this.score.update();

		if (this.players[1].ai || game.mode === 'vsOnline') {
			cam1.renderSingleView();
		} else {
			cam1.renderSplitView(0);
			cam2.renderSplitView(1);
			displayDiv('vertical-line');
		}
	}
	
	sendGameState(socket) {
		if (socket.readyState === WebSocket.OPEN) {
			// Construct the game state data
			const player1 = this.game.match.players[0];
			const myRole = player1.online_role;
			let gameState;
			if (myRole === 'A') {
				gameState = {
					type: 'game_update',
					paddle_A: this.game.paddle1.mesh.position.z,
					ball_x: this.game.ball.mesh.position.x,
					ball_z: this.game.ball.mesh.position.z,
				};
			}
			else {
				gameState = {
					type: 'game_update',
					paddle_B: this.game.paddle1.mesh.position.z,
				};
			}
			// Send the game state to the server
			socket.send(JSON.stringify(gameState));
		} else {
			console.error('WebSocket is not open. Ready state:', socket.readyState);
		}
	}
}

export { Match };