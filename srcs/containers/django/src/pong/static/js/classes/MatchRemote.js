import { getRandomInt, textToDiv, HTMLToDiv, countdown, waitForEnter } from '../utils.js';
import { Score } from './Score.js';
// import { tournament } from './tournament.js';





class MatchRemote {
	constructor(game, players, connection) {
        if (!game || !players || !connection) {
            throw new Error('Game, players and connection are required.');
        }
		
        this.game = game;
        this.players = players;
        this.connection = connection;
        this.running = false;
        this.score = new Score(game, players);
        this.timestamp = null;
        this.keys = {};

        this.setupEventListeners();
        console.log('Match instance created');
    }

	setupEventListeners() {
        document.addEventListener("keydown", (event) => this.handleKey(event, true));
        document.addEventListener("keyup", (event) => this.handleKey(event, false));
        document.addEventListener("touchstart", (event) => this.handleTouchStart(event));
        document.addEventListener("touchend", () => this.handleTouchEnd());
    }

    handleKey(event, isPressed) {
        this.keys[event.key] = isPressed;
        this.sendKeyUpdate(event.key, isPressed);
    }


    handleKeyup(event) {
        this.keys[event.key] = false;
        this.sendKeyUpdate(event.key, false);
    }

    handleTouchStart(event) {
        const touchX = event.touches[0].clientX;
        const middle = window.innerWidth / 2;

        if (touchX < middle) {
            this.keys['a'] = true;
            this.keys['d'] = false;
        } else {
            this.keys['a'] = false;
            this.keys['d'] = true;
        }

        this.sendTouchUpdate(this.keys);
    }

    handleTouchEnd() {
        this.keys['a'] = false;
        this.keys['d'] = false;
        this.sendTouchUpdate(this.keys);
    }

    sendKeyUpdate(key, isPressed) {
        if (this.connection) {
            this.connection.send(JSON.stringify({
                type: 'key_update',
                key: key,
                isPressed: isPressed,
                player: this.game.currentPlayerName,
            }));
        }
    }

    sendTouchUpdate(keys) {
        if (this.connection) {
            this.connection.send(JSON.stringify({
                type: 'touch_update',
                keys: keys,
                player: this.game.currentPlayerName,
            }));
        }
    }

    receiveKeyUpdate(data) {
        if (data.player !== this.game.currentPlayerName) {
            this.keys[data.key] = data.isPressed;
        }
    }


	async handleGameUpdate(data) {
		console.log('Handling game update with data:', data);
		
		if (data.player !== this.game.currentPlayerName) {
			console.log('Updating game state:');
			console.log('Ball Position:', data.ballPosition);
			console.log('Paddle1 Position:', data.paddle1Position);
			console.log('Paddle2 Position:', data.paddle2Position);
			console.log('Score:', data.score);
	
			this.game.ball.position = data.ballPosition;
			this.game.paddle1.position = data.paddle1Position;
			this.game.paddle2.position = data.paddle2Position;
			this.score.result = data.score;
		}
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

		// console.log('before : this.startMatch');
		// await this.startMatch(); 
		// console.log('after : this.startMatch');

		// Main game loop
		this.running = true; // Start the game
        while (this.running) {
            this.update();
            this.sendGameState();
            await new Promise(resolve => setTimeout(resolve, 1000 / 60)); // 60 FPS
        }
	}

	sendGameState() {
        if (this.connection) {
            this.connection.send(JSON.stringify({
                type: 'game_state_update',
                ballPosition: this.game.ball.position,
                paddle1Position: this.game.paddle1.position,
                paddle2Position: this.game.paddle2.position,
                score: this.score.result,
            }));
        }
    }

	receiveGameState(data) {
        if (data.player !== this.game.currentPlayerName) {
            this.game.ball.position = data.ballPosition;
            this.game.paddle1.position = data.paddle1Position;
            this.game.paddle2.position = data.paddle2Position;
            this.score.result = data.score;
        }
    }

	update() {
		const field = this.game.field;
		const paddle1 = this.game.paddle1;
		const paddle2 = this.game.paddle2;
		const ball = this.game.ball;
	
		console.log('Field:', field);
		console.log('Paddle1:', paddle1);
		console.log('Paddle2:', paddle2);
		console.log('Ball:', ball);
	
		if (!paddle1 || !paddle2) {
			console.error('One or both paddles are not initialized.');
			return;
		}
	
		let direction = this.keys['a'] ? -1 : this.keys['d'] ? 1 : 0;
		if (paddle1) paddle1.movePaddle(direction, field);
	
		direction = this.keys['ArrowLeft'] ? -1 : this.keys['ArrowRight'] ? 1 : 0;
		if (paddle2) paddle2.movePaddle(direction, field);
	
		ball.animateBall();
		ball.tryPaddleCollision(paddle1, paddle2);
		ball.tryCourtCollision(field);
	
		this.score.update();
	}
	
	

	// async startMatch() {

	// 	// if (!this.game.audio) {
	// 	// 	console.error('1.Audio has not been initialized');
	// 	// 	return;
	// 	// }
	// 	// Log the game object and its properties
	// 	console.log('Game object:', this.game);
	// 	console.log('Game object:', this.game.tournament);

	// 	console.log('Game ball:', this.game.tournament ? this.game.tournament.ball : 'Game object is undefined');

	// 	const ball = this.game && this.game.tournament ? this.game.tournament.ball : null;
		

	// 	if (!ball) {
	// 		console.error('Ball is not defined in game.');
	// 		return;
	// 	}

	// 	this.initializeDOMElements2();

	// 	// HTMLToDiv(``, 'announcement-l1');
	// 	// HTMLToDiv(``, 'announcement-mid');
	// 	// HTMLToDiv(``, 'announcement-l2');

	// 	//I should fix music later
	// 	await countdown(2, this.game.audio);


	// 	const menu = document.getElementById('menu');
	// 	if (menu) {
	// 		menu.classList.add('fade-out');
	// 		setTimeout(() => menu.classList.add('hidden'), 1500);
	// 	} else {
	// 		console.error('Menu element not found');
	// 	}
		
	// 	this.game.running = true;
	// 	this.timestamp = Date.now();
	
	// 	// Randomly select which player serves first
	// 	const serveDirection = getRandomInt(0, 2) ? 1 : -1;
	
	// 	// Send serve direction to the other player
	// 	this.connection.send(JSON.stringify({
	// 		type: 'serve',
	// 		serveDirection: serveDirection
	// 	}));
	
	// 	console.log('111111111');
	// 	// Wait for confirmation from the other player
	// 	// await new Promise((resolve) => {
	// 	// 	const onMessageHandler = (event) => {
	// 	// 		console.log('121212121');
	// 	// 		const message = JSON.parse(event.data);
	// 	// 		if (message.type === 'serve') {
	// 	// 			resolve();
	// 	// 			this.connection.removeEventListener('message', onMessageHandler);
	// 	// 		} else {
	// 	// 			console.log('131313131');
	// 	// 		}
	// 	// 	};
	// 	// 	this.connection.addEventListener('message', onMessageHandler);
	// 	// });

	// 	console.log('2222222222');
	
	// 	ball.serve = serveDirection;
	// 	console.log('232333232323');
	// 	ball.serveBall();
	
	// 	textToDiv('', 'announcement-l1');
	// 	console.log('3333333333');
	// 	// Handle game loop and synchronization with the remote player
	// 	while (this.game.running) {
	// 		// Update the game state and sync with the remote player
	// 		this.updateremote();
	// 		await new Promise(resolve => setTimeout(resolve, 16)); // ~60 FPS
	// 	}
	// }
	

	
}



export { MatchRemote};
