import { getRandomInt, textToDiv, HTMLToDiv, countdown, waitForEnter } from '../utils.js';
import { Score } from './Score.js';
// import { Tournament } from './Tournament.js';
// import { Game } from './Game.js';

class Match {
		constructor(game, players, connection) {

		if (!game || !players || !connection) {
			throw new Error('Game, players and connection are not provided.');
		}

		this.game = game;
		this.players = players;
		this.running = false;
		this.score = new Score(game, players);
		this.timestamp = null;
		this.connection = connection;  // Corrected from `game.conection` to `game.connection`

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

	// async play() {
	// 	const player1Name = this.players[0].name;
	// 	const player2Name = this.players[1].name;

	// 	await window.loadPage('pong');
	// 	console.log('Match started');
		
	// 	const ball = this.game.ball;
	// 	HTMLToDiv(`${player1Name}`, 'announcement-l1');
	// 	HTMLToDiv(`VS`, 'announcement-mid');
	// 	HTMLToDiv(`${player2Name}`, 'announcement-l2');
	// 	textToDiv('0', 'player1-score');
	// 	textToDiv(player1Name, 'player1-name');
	// 	textToDiv('0', 'player2-score');
	// 	textToDiv(player2Name, 'player2-name');

	// 	const enter = document.getElementById('enter');
	// 	enter.style.display = 'block';
	// 	await waitForEnter(enter);
	// 	HTMLToDiv(``, 'announcement-l1');
	// 	HTMLToDiv(``, 'announcement-mid');
	// 	HTMLToDiv(``, 'announcement-l2');
	// 	await countdown(2, this.game.audio);
	// 	const menu = document.getElementById('menu');
	// 	menu.classList.add('fade-out');
	// 	setTimeout(function() {
	// 		menu.classList.add('hidden');
	// 	}, 1500); 
		
	// 	this.game.running = true;
	// 	this.timestamp = Date.now();
	// 	ball.serve = getRandomInt(0, 2) ? 1 : -1;
	// 	ball.serveBall();
	// 	textToDiv('', 'announcement-l1');
	// }

	// update() {
	// 	const field = this.game.field;
	// 	const paddle1 = this.game.paddle1;
	// 	const paddle2 = this.game.paddle2;
	// 	const ball = this.game.ball;
	// 	const cam1 = this.game.cam1;
	// 	const cam2 = this.game.cam2;
	
	// 	// move left paddle
	// 	let direction = this.keys['a'] ? -1 : this.keys['d'] ? 1 : 0;
	// 	paddle1.movePaddle(direction, field);
	
	// 	// move right paddle
	// 	direction = this.players[1].ai ? this.players[1].ai.movePaddle(paddle2) :
	// 		this.keys['ArrowRight'] ? -1 :
	// 		this.keys['ArrowLeft'] ? 1 :
	// 		0;
	// 	paddle2.movePaddle(direction, field);
	
	// 	// move and bounce ball
	// 	ball.animateBall();
	// 	ball.tryPaddleCollision(paddle1, paddle2);
	// 	ball.tryCourtCollision(field);
	
	// 	const split = document.getElementById('vertical-line');
	// 	this.score.update();

	// 	if (this.players[1].ai) {
	// 		cam1.renderSingleView(this.game);
	// 	} else {
	// 		cam1.renderSplitView(this.game, 0);
	// 		cam2.renderSplitView(this.game, 1);
	// 		split.style.display = 'block';
	// 	}
	// }

	async playRemote() {
		const player1Name = this.players[0].name;
		const player2Name = this.players[1].name;
		console.log('player1Name:', player1Name);
		console.log('player2Name:', player2Name);

		console.log('Match this.connection:',this.connection);


		if (!this.connection) {
			console.error('No valid WebSocket connection found');
			return;
		}

		// Notify the server that this player is ready to load the page
		if (this.connection) {
			this.connection.send(JSON.stringify({
				type: 'load_page'
			})); 
		} else {
			console.error('No valid WebSocket connection found');
		}

		// Wait for both players to be instructed to load the page
		const loadPagePromise = new Promise((resolve) => {
			const onMessageHandler = (event) => {
				console.log('Message received:', event.data);
				const message = JSON.parse(event.data);
				if (message.type === 'load_page') {
					console.log('Received load_page message');
					resolve();
					this.connection.removeEventListener('message', onMessageHandler);
				}
			};
			this.connection.addEventListener('message', onMessageHandler);
		});

		console.log('Waiting for load_page message');
		await loadPagePromise;  // Wait until the other player also loads the page
		console.log('Received load_page message, now loading page');
		// await window.loadPage('pong');
		// here loadPage should be displayed in player 2
		console.log('Match started remotely');

		const ball = this.game.ball;

		
		
		
		console.log('Waiting for load_page message');
		await loadPagePromise;

		setTimeout(() => {
			const announcementL1 = document.getElementById('announcement-l1');
			if (announcementL1) {
				HTMLToDiv(`${player1Name}`, 'announcement-l1');
				HTMLToDiv('VS', 'announcement-mid');
				HTMLToDiv(`${player2Name}`, 'announcement-l2');
				textToDiv('0', 'player1-score');
				textToDiv(player1Name, 'player1-name');
				textToDiv('0', 'player2-score');
				textToDiv(player2Name, 'player2-name');
			} else {
				console.error('Announcement elements not found');
			}
		}, 3000);


	
	

		setTimeout(() => {
			const enter = document.getElementById('enter');
			if (!enter) {
				console.error('Enter element not found');
				return;
			}
			enter.style.display = 'block';
			console.log('Enter element is now visible');
			
		}, 1000);  // 3-second delay

		console.log('setting up Enter');

		// Wait for the local player to press enter
		await waitForEnter(enter);
		// setTimeout(() => {
		// 	waitForEnter(enter);
			
		// }, 3000);

		// Notify the server that Player 1 has pressed "enter"
		if (this.connection) {
			this.connection.send(JSON.stringify({
				type: 'enter_pressed',
				player: this.players[0].name  // Assuming Player 1 is always the one pressing enter
			}));
		} else {
			console.error('No valid WebSocket connection found');
		}

		// Player 2 receives the update that Player 1 pressed "enter"
		const enterAcknowledged = new Promise((resolve) => {
			const onMessageHandler = (event) => {
				console.log('Message received:', event.data);
				const message = JSON.parse(event.data);
				if (message.type === 'enter_acknowledged' && message.player === this.players[1].name) {
					console.log(`Player 2 is ready after Player 1 pressed enter`);
					resolve();
					this.connection.removeEventListener('message', onMessageHandler);
				}
			};
			this.connection.addEventListener('message', onMessageHandler);
		});

		// Wait for the server to acknowledge that Player 2 is ready
		await enterAcknowledged;
	




		console.log('000000000');











		HTMLToDiv(``, 'announcement-l1');
		HTMLToDiv(``, 'announcement-mid');
		HTMLToDiv(``, 'announcement-l2');
		await countdown(2, this.game.audio);


		const menu = document.getElementById('menu');
		if (menu) {
			menu.classList.add('fade-out');
			setTimeout(() => menu.classList.add('hidden'), 1500);
		} else {
			console.error('Menu element not found');
		}
		
		this.game.running = true;
		this.timestamp = Date.now();
	
		// Randomly select which player serves first
		const serveDirection = getRandomInt(0, 2) ? 1 : -1;
	
		// Send serve direction to the other player
		this.connection.send(JSON.stringify({
			type: 'serve',
			serveDirection: serveDirection
		}));
	
		console.log('111111111');
		// Wait for confirmation from the other player
		await new Promise((resolve) => {
			const onMessageHandler = (event) => {
				const message = JSON.parse(event.data);
				if (message.type === 'serve') {
					resolve();
					this.connection.removeEventListener('message', onMessageHandler);
				}
			};
			this.connection.addEventListener('message', onMessageHandler);
		});
	
		ball.serve = serveDirection;
		ball.serveBall();
	
		textToDiv('', 'announcement-l1');
		console.log('3333333333');
		// Handle game loop and synchronization with the remote player
		while (this.game.running) {
			// Update the game state and sync with the remote player
			this.remoteupdate();
			await new Promise(resolve => setTimeout(resolve, 16)); // ~60 FPS
		}
	}
	
	// Example function to update game state and synchronize with remote player
	async remoteupdate() {
		// Update the local game state here (e.g., move ball, check for collisions, etc.)
	
		// Send the current state to the other player
		this.game.connection.send(JSON.stringify({
			type: 'game_state',
			ballPosition: this.game.ball.position,
			player1Score: this.game.score.player1,
			player2Score: this.game.score.player2
		}));
	
		// Listen for the remote player's state updates
		const onMessageHandler = (event) => {
			const message = JSON.parse(event.data);
			if (message.type === 'game_state') {
				// Update the local game state with the received data
				this.game.ball.position = message.ballPosition;
				this.game.score.player1 = message.player1Score;
				this.game.score.player2 = message.player2Score;
			}
		};
		this.game.connection.addEventListener('message', onMessageHandler);
	}
	
	
}



export { Match };