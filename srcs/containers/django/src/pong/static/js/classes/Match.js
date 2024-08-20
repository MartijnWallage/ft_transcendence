import { getRandomInt, textToDiv, HTMLToDiv, countdown, waitForEnter } from '../utils.js';
import { Score } from './Score.js';

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

		// this.enterElement = document.getElementById('enter');
        // if (!this.enterElement) {
        //     console.error('Enter element not found');
        //     return;
        // }
        // this.enterElement.style.display = 'block';
        // console.log('Enter element is now visible');

	}

	// Initialize DOM elements related to the match
	async initializeDOMElements() {
        const retryInterval = 500; // Time between retries in milliseconds
        const maxRetries = 10; // Maximum number of retries
        let retryCount = 0;

        while (retryCount < maxRetries) {
            try {
                const player1Name = this.players[0].name;
                const player2Name = this.players[1].name;

                HTMLToDiv(player1Name, 'announcement-l1');
                HTMLToDiv('VS', 'announcement-mid');
                HTMLToDiv(player2Name, 'announcement-l2');
                textToDiv('0', 'player1-score');
                textToDiv(player1Name, 'player1-name');
                textToDiv('0', 'player2-score');
                textToDiv(player2Name, 'player2-name');

                const enter = document.getElementById('enter');
                if (enter) {
                    enter.style.display = 'block';
                    console.log('Enter element is now visible');
                    return; // Exit loop if successful
                } else {
                    throw new Error('Enter element not found');
                }
            } catch (error) {
                console.error(error.message);
                retryCount++;
                await new Promise(resolve => setTimeout(resolve, retryInterval));
            }
        }

        console.error('Failed to initialize DOM elements after retries');
    }

	// Initialize DOM elements for a different state with retry mechanism
    async initializeDOMElements2() {
        const retryInterval = 500; // Time between retries in milliseconds
        const maxRetries = 10; // Maximum number of retries
        let retryCount = 0;

        while (retryCount < maxRetries) {
            try {
                HTMLToDiv('', 'announcement-l1');
                HTMLToDiv('', 'announcement-mid');
                HTMLToDiv('', 'announcement-l2');

                const enter = document.getElementById('enter');
                if (enter) {
                    enter.style.display = 'block';
                    console.log('Enter element is now visible in initializeDOMElements2');
                    return; // Exit loop if successful
                } else {
                    throw new Error('Enter element not found');
                }
            } catch (error) {
                console.error(error.message);
                retryCount++;
                await new Promise(resolve => setTimeout(resolve, retryInterval));
            }
        }

        console.error('Failed to initialize DOM elements 2 after retries');
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

		// Verify the game object and properties
		console.log('Match this.game:', this.game);
		console.log('Match this.game.tournament:', this.game ? this.game.tournament : 'Game is undefined');
		
		const ball = this.game && this.game.tournament ? this.game.tournament.ball : null;
		console.log('Match ball:', ball ? 'Ball is defined' : 'Ball is undefined');
		
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

		this.initializeDOMElements();

		// Wait for audio to be initialized
		// if (!this.game.audio) {
		// 	console.error('0.Audio has not been initialized');
		// 	return;
		// }

		console.log('Waiting for load_page message');
		// await new Promise(resolve => setTimeout(resolve, 1000));

		console.log('Received load_page message, now loading page');
		// await window.loadPage('pong');
		// here loadPage should be displayed in player 2
		console.log('Match started remotely');

		
		console.log('setting up Enter');

		// Retry mechanism for finding the "Enter" element
		const retryInterval = 500; // Time between retries in milliseconds
		const maxRetries = 10; // Maximum number of retries
		let retryCount = 0;
		let enterElement = null;

		while (retryCount < maxRetries) {
			enterElement = document.getElementById('enter');
			if (enterElement) {
				console.log('Enter element found');
				break;
			}

			retryCount++;
			console.error(`Enter element not found, retrying (${retryCount}/${maxRetries})...`);
			await new Promise(resolve => setTimeout(resolve, retryInterval));
		}

		if (enterElement) {
			await waitForEnter(enterElement);
			
			// Add a 3-second delay after Enter is clicked
			await new Promise(resolve => setTimeout(resolve, 3000));
		} else {
			console.error('Enter element not found after retries');
			return;
		}

		console.log('Enter was clicked');

		// const enterElement = document.getElementById('enter');
		// if (enterElement) {
		// 	console.log('Enter element found');
		// 	await waitForEnter(enterElement);
		// } else {
		// 	console.error('Enter element not found');
		// }

		
		console.log('Enter was clicked');
		
		// Wait for 3 seconds before proceeding
		// await new Promise(resolve => setTimeout(resolve, 3000));

		// Notify the server that Player 1 has pressed "enter"
		if (this.connection) {
			this.connection.send(JSON.stringify({
				type: 'enter_pressed',
				player: this.players[0].name  // Assuming Player 1 is always the one pressing enter
			}));
		} else {
			console.error('No valid WebSocket connection found');
		}

		console.log('before : this.startMatch');
		await this.startMatch(); 
		console.log('after : this.startMatch');
	}


	async startMatch() {

		// if (!this.game.audio) {
		// 	console.error('1.Audio has not been initialized');
		// 	return;
		// }
		// Log the game object and its properties
		console.log('Game object:', this.game);
		console.log('Game object:', this.game.tournament);

		console.log('Game ball:', this.game.tournament ? this.game.tournament.ball : 'Game object is undefined');

		const ball = this.game && this.game.tournament ? this.game.tournament.ball : null;
		

		if (!ball) {
			console.error('Ball is not defined in game.');
			return;
		}

		this.initializeDOMElements2();

		// HTMLToDiv(``, 'announcement-l1');
		// HTMLToDiv(``, 'announcement-mid');
		// HTMLToDiv(``, 'announcement-l2');

		//I should fix music later
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
		// await new Promise((resolve) => {
		// 	const onMessageHandler = (event) => {
		// 		console.log('121212121');
		// 		const message = JSON.parse(event.data);
		// 		if (message.type === 'serve') {
		// 			resolve();
		// 			this.connection.removeEventListener('message', onMessageHandler);
		// 		} else {
		// 			console.log('131313131');
		// 		}
		// 	};
		// 	this.connection.addEventListener('message', onMessageHandler);
		// });

		console.log('2222222222');
	
		ball.serve = serveDirection;
		console.log('232333232323');
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