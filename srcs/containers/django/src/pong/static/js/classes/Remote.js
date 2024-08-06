class Remote {
	constructor(websocket) {
		this.websocket = websocket;
	}

	// getCommand() {
	// 	// Implement the logic to fetch the last command received via WebSocket
	// 	// This is a placeholder implementation
	// 	let command = 0;
	// 	this.websocket.onmessage = (event) => {
	// 		const message = JSON.parse(event.data);
	// 		if (message.type === 'player_action') {
	// 			command = message.data.command; // Assuming the command is in message.data.command
	// 		}
	// 	};
	// 	return command;
	// }
}


export { Remote };



// class Remote {
// 	constructor() {
// 		this.commandQueue = [];
// 		this.setupWebSocket();
// 	}

// 	setupWebSocket() {
// 		console.log('Creating a new WebSocket connection...'); 
// 		const socketUrl = 'wss://10.15.109.3:8443/ws/pingpongsocket/';
// 		this.socket = new WebSocket(socketUrl);

// 		this.socket.onopen = () => {
// 			console.log('WebSocket connection established.');
// 			// Optionally, send a message to the server to indicate that the player is ready
// 			this.sendCommand({ type: 'players_ready' });
// 		};

// 		this.socket.onmessage = (event) => {
// 			this.handleMessage(event.data);
// 		};

// 		this.socket.onclose = () => {
// 			console.log('WebSocket connection closed.');
// 		};

// 		this.socket.onerror = (error) => {
// 			console.error('WebSocket error:', error);
// 		};
// 	}

// 	handleMessage(data) {
// 		try {
// 			const message = JSON.parse(data);
// 			if (message.type === 'move') {
// 				this.commandQueue.push(message.command);
// 			}
// 		} catch (error) {
// 			console.error('Error handling message:', error);
// 		}
// 	}

// 	getCommand() {
// 		// If there are commands in the queue, return the first one
// 		if (this.commandQueue.length > 0) {
// 			return this.commandQueue.shift(); // Remove and return the oldest command
// 		}
// 		return 0; // Default to no movement if no command is available
// 	}

// 	sendCommand(command) {
// 		if (this.socket.readyState === WebSocket.OPEN) {
// 			this.socket.send(JSON.stringify(command));
// 		} else {
// 			console.error('WebSocket is not open. Command not sent:', command);
// 		}
// 	}
// }

// export { Remote };



// //have to fix

// import { gameState } from './game-state.js';
// import { startGame } from './start-end-game.js';
// import { ball, updateLocalGameState } from './update.js';
// import { endTournament } from './tournament-end.js';


// async function startGameUserVsUserremote() {
//     const error = document.getElementById('error');

//     // Clear any previous error messages
//     if (error) {
//         error.style.display = 'none';
//     }

//     try {
//         // Load the game page
//         await loadPage('pong');

//         // Initialize the WebSocket connection
//         initializeWebSocket();
	
// 	} catch (err) {
//         console.error('Error starting game:', err);
// 		if (error) {
//             error.style.display = 'block';
//             error.textContent = 'Error starting the game. Please try again.';
//         }
// 	}
// }


// let pingpongsocket = null;

// function initializeWebSocket() {
//     // This message will be printed when the WebSocket is created
// 	console.log('Creating a new WebSocket connection...'); 
// 	pingpongsocket = new WebSocket('wss://10.15.109.3:8443/ws/pingpongsocket/');
    
//     pingpongsocket.onopen = function() {
//         console.log('WebSocket is connected.');
// 		initiateRemotePlay();

//     };

//     pingpongsocket.onmessage = function(event) {
//         try {
//             const data = JSON.parse(event.data);
//             console.log('Message from server:', data);
//             handleServerMessage(data); // Ensure data is passed to handleServerMessage
//         } catch (error) {
//             console.error('Error parsing message from server:', error);
//         }
//     };

//     pingpongsocket.onclose = function(event) {
//         console.log('WebSocket is closed.');
//     };

//     pingpongsocket.onerror = function(error) {
//         console.error('WebSocket error: ', error);
//     };
// }


// function handleServerMessage(data) {

//     if (data.type === 'players_ready') {
//         console.log('Player statuses received:', data.players);

// 		// Check and set game state
//         if (!Array.isArray(data.players) || data.players.length !== 2) {
//             console.error('Invalid player data received.');
//             return;
//         }

//         gameState.players = data.players.map((player) => 
//             player.role === 'first' ? 'Player 1' : 'Player 2'
//         );

//         console.log('Current gameState.players:', gameState.players);

//         if (data.players.length === 2 && !gameState.gameStarted) {
//             console.log('Both players are ready. Starting the game.');
// 			gameState.gameStarted = true;
// 			startGame(gameState.players[0], gameState.players[1], 'remote');  
//         } else {
//             console.log('Waiting for both players to be ready...');
//         }
//     } else if (data.type === 'player_disconnected') {
//         console.log('A player has disconnected. Current players:', data.players);
//         // Handle player disconnection if needed
//     } else if (data.type === 'game_update') {
//         console.log('Game update received:', data.game_state);
//         updateLocalGameState(data.game_state); // Sync local game state
//     } else {
//         console.log('Unhandled message type:', data.type);
//     }
// }


// function initiateRemotePlay() {
//     const message = { type: 'initiate_remote_play' };
//     sendMessageToWebSocket(message);
// }



// function players_ready() {
// 	const message = { type: 'player_ready', data: {} };
// 	sendMessageToWebSocket(message);
// }

// function sendMessageToWebSocket(message) {
// 	if (pingpongsocket && pingpongsocket.readyState === WebSocket.OPEN) {
// 		pingpongsocket.send(JSON.stringify(message));
// 		console.log('Message sent:', message);
// 	} else {
// 		console.error('WebSocket is not open to send messages. Retrying...');
// 		setTimeout(() => sendMessageToWebSocket(message), 1000); // Retry after 1 second
// 	}
// }




// function nextGame() {
// 	gameState.running = true;
// 	gameState.currentGameIndex += 1;
// 	console.log('Game index:', gameState.currentGameIndex);
// 	console.log('Match order length:', gameState.matchOrder.length);
// 	if (gameState.currentGameIndex > gameState.matchOrder.length) {
// 		endTournament();
// 		return ;
// 	}
// 	const player1 = gameState.players[gameState.matchOrder[gameState.currentGameIndex - 1][0]];
// 	const player2 = gameState.players[gameState.matchOrder[gameState.currentGameIndex - 1][1]];
// 	console.log('Next match:', player1, 'vs', player2);
// 	startGame(player1, player2, 'tournament');
// }

// function displayPlayers() {
// 	const playerListDiv = document.getElementById('playerList');
// 	playerListDiv.innerHTML = ''; // Clear existing list
// 	console.log('Players:', gameState.players);
// 	gameState.players.forEach(player => {
// 		let index = gameState.players.indexOf(player) + 1;
// 		let name = player;
// 		const playerElement = document.createElement('p');
// 		playerElement.textContent = `Player ${index}: ${name}`;
// 		playerListDiv.appendChild(playerElement);
// 	});
// }

// function matchOrderInit() {
// 	for (let i = 0; i < gameState.players.length; i++) {
// 		for (let j = i + 1; j < gameState.players.length; j++) {
// 			gameState.matchOrder.push([i, j]);
// 		}
// 	}
// 	console.log('Match order:', gameState.matchOrder);
// }

// function scoreBoardInit() {
// 	for (let i = 0; i < gameState.players.length; i++) {
// 		gameState.scoreBoard.push(0);
// 	}
// }

// function initializeTournament() {
//     initializeWebSocket();
// 	console.log('Players:', gameState.players); 
//     // Set up initial state for the tournament
// 	matchOrderInit();    
// 	scoreBoardInit();
// 	nextGame();
// 	console.log('Players length:', gameState.players.length);
// }


// function displayScoreTournament() {
// 	displayScore();
// 	ctx.fillText( `${gameState.players[gameState.matchOrder[gameState.currentGameIndex - 1][0]]} Score: ` + gameState.playerScores[0], 20, 30);
// 	ctx.fillText( `${gameState.players[gameState.matchOrder[gameState.currentGameIndex - 1][1]]} Score: ` + gameState.playerScores[1], canvas.width - 180, 30);
// }

// function updateScoreTournament() {
// 	if (ball.x < 0) {
// 		gameState.playerScores[0] += 1;
// 		ball.resetBall();
// 	} else if (ball.x + ball.width > canvas.width) {
// 		gameState.playerScores[1] += 1;
// 		ball.resetBall();
// 	}

// 	if (gameState.playerScores[0] === gameState.scoreToWin || gameState.playerScores[1] === gameState.scoreToWin) {
// 		if (gameState.playerScores[0] == gameState.scoreToWin) {
// 			setTimeout(function() {
// 				alert(`${gameState.players[gameState.matchOrder[gameState.currentGameIndex - 1][0]]} wins!`);
// 			}
// 			, 100);
// 			return false;
// 		}
// 		else {
// 			setTimeout(function() {
// 				alert(`${gameState.players[gameState.matchOrder[gameState.currentGameIndex - 1][1]]} wins!`);
// 			}
// 			, 100);
// 			return false;
// 		}
// 	}
// 	return true;
// }

// // export { initializeWebSocket, handleServerMessage, players_ready, addPlayer, displayPlayers, initializeTournament, displayScoreTournament, updateScoreTournament, nextGame };
// // export { initializeWebSocket, handleServerMessage, players_ready, displayPlayers, initializeTournament, displayScoreTournament, updateScoreTournament, nextGame };
// export { sendMessageToWebSocket, startGameUserVsUserremote, initiateRemotePlay, initializeWebSocket, handleServerMessage, players_ready, displayPlayers, initializeTournament, displayScoreTournament, updateScoreTournament, nextGame };


