import { getRandomInt, textToDiv, HTMLToDiv, countdown, waitForEnter } from '../utils.js';
import { Score } from './Score.js';

class Match {
	constructor(game, players) {
		this.game = game;
		this.players = players;
		this.running = false;
		this.score = new Score(game, players);
		this.timestamp = null;

		//key listener
		this.keys = {};
		document.addEventListener("keydown", (event) => { 
			this.keys[event.key] = true; 
		});
		
		document.addEventListener("keyup", (event) => {
			this.keys[event.key] = false;
		});
	}

	async play() {
		const player1Name = this.players[0].name;
		const player2Name = this.players[1].name;

		await window.loadPage('pong');
		this.game.running = true;
		console.log('Match started');

		const ball = this.game.ball;
		HTMLToDiv(`${player1Name}<br>VS<br>${player2Name}`, 'announcement');

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
		
		this.timestamp = Date.now();
		ball.serve = getRandomInt(0, 2) ? 1 : -1;
		ball.serveBall();
		textToDiv('0', 'player1-score');
		textToDiv(player1Name, 'player1-name');
		textToDiv('0', 'player2-score');
		textToDiv(player2Name, 'player2-name');
	}

	update() {
		const field = this.game.field;
		const paddle1 = this.game.paddle1;
		const paddle2 = this.game.paddle2;
		const ball = this.game.ball;
		const cam1 = this.game.cam1;
		const cam2 = this.game.cam2;
	
		// move left paddle
		let direction = this.keys['a'] ? -1 : this.keys['d'] ? 1 : 0;
		paddle1.movePaddle(direction, field);
	
		// move right paddle
		direction = this.players[1].ai ? this.players[1].ai.movePaddle(paddle2, ball) :
			this.keys['ArrowRight'] ? -1 :
			this.keys['ArrowLeft'] ? 1 :
			0;
		paddle2.movePaddle(direction, field);
	
		// move and bounce ball
		ball.animateBall();
		ball.tryPaddleCollision(paddle1, paddle2, this.game.audio);
		ball.tryCourtCollision(field);
	
		const split = document.getElementById('vertical-line');
		this.score.update();
		if (this.players[1].ai) {
			cam1.renderSingleView(this.game);
		} else {
			cam1.renderSplitView(this.game, 0);
			cam2.renderSplitView(this.game, 1);
			split.style.display = 'block';
		}
	}
}

export { Match };